// ────────── Module Importing ──────────
import { WebSocketServer } from 'ws';
import type { WebSocket } from 'ws';
import type { Server } from 'https';

// ────────── Custom Modules ──────────
import { handleClientMessage } from './webSocketHelper.ts'
import { colorizeANSI } from './utils.ts';

// ────────── WebSocket Handler Module ──────────(Contains famework logic)
type WSMessage = {
    authToken: string;
    message: any;
};

// Internal authenticated client record
// Previously contained "authenticated: boolean", but this has been removed. Use "authToken" vor validating instead. No authToken != authenticated.
export interface ClientSession {
    authToken: string;
    username: string;
    userID: number;
    clientIP: string;
}

let wss: WebSocketServer | null = null;

// Store authenticated clients keyed by their WebSocket instance
const authenticatedClients = new Map<WebSocket, ClientSession>();
// Store pending logins keyed by their authToken
const pendingLogins = new Map<string, ClientSession>();

export function initializeWebSocketServer(server: Server) {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws: WebSocket, req) => {
        // Extract and normalize client IP address
        let clientIP = req.socket.remoteAddress || 'unknown-ip';
        if (clientIP.startsWith('::ffff:')) {
            clientIP = clientIP.substring(7);
        }

        // Add a temporary unauthenticated session
        authenticatedClients.set(ws, {
            authToken: '',
            username: '',
            userID: null,
            clientIP: clientIP
        });

        // Authenticate client on first message only, further messages handled by other listener
        ws.once('message', (data) => {
            try {
                // Parse initial message
                const { authToken: clientAuthToken, message } = JSON.parse(data.toString());

                // Ensure message is an auth request
                if (!message || message.type !== 'auth' || !clientAuthToken) {
                    ws.send(JSON.stringify({ error: 'Invalid authentication format' }));
                    ws.close();
                    return;
                }

                // Lookup pending login by token
                const pending = pendingLogins.get(clientAuthToken);
                if (!pending) {
                    ws.send(JSON.stringify({ error: 'No pending login for this token' }));
                    ws.close();
                    return;
                }

                // Check consistency between pending login and client message
                if (
                    message.username !== pending.username ||
                    message.userID !== pending.userID ||
                    clientIP !== pending.clientIP
                ) {
                    ws.send(JSON.stringify({ error: 'Authentication data mismatch' }));
                    logError(`Mismatch for token "${clientAuthToken}" from ${clientIP}`);
                    ws.close();
                    return;
                }

                // Prevent duplicate connections - Remove Code
                const existingSession = [...authenticatedClients.values()].find(s =>
                    s.authToken === clientAuthToken ||
                    s.username === pending.username
                );
                if (existingSession) {
                    ws.send(JSON.stringify({ error: 'Duplicate session' }));
                    ws.close();
                    return;
                }

                // Upgrade template entry with pending login data
                authenticatedClients.set(ws, {
                    authToken: pending.authToken,
                    username: pending.username,
                    userID: pending.userID,
                    clientIP: pending.clientIP
                });

                // Remove pending login
                pendingLogins.delete(clientAuthToken);

                // Log success
                logWS(`Client ${colorizeANSI('Connected', 'green')} | [${colorizeANSI('Authenticated', 'green')}]`);
                logSingleClient(clientAuthToken, pending.username, pending.userID, pending.clientIP);
                console.log('▀'.repeat(45));
                logConnectedClients();

                // Enable further message handling
                setupMessageListener(ws);

            } catch (err) {
                ws.send(JSON.stringify({ error: 'Invalid message format' }));
                ws.close();
            }
        });

        ws.on('close', () => {
            const clientData = authenticatedClients.get(ws);
            if (clientData?.authToken) {
                logWS(`Client ${colorizeANSI('Disconnected', 'red')} | [${colorizeANSI('Authenticated', 'green')}]`);
                logSingleClient(clientData.authToken, clientData.username, clientData.userID, clientData.clientIP);
            } else {
                logWS(`Client ${colorizeANSI('Disconnected', 'red')} | [${colorizeANSI('Unauthenticated', 'red')}]`);
                logSingleClient(clientData.authToken, clientData.username, clientData.userID, clientData.clientIP);
            }
            authenticatedClients.delete(ws);
            logConnectedClients();
        });
    });
}

// ────────── Permanent Message Listener ──────────
function setupMessageListener(ws: WebSocket) {
    ws.on('message', (data) => {
        try {
            const { authToken, message } = JSON.parse(data.toString());

            const clientInfo = authenticatedClients.get(ws);

            // Prevent spoofing by validating authToken on every message
            if (authToken !== clientInfo.authToken) {
                ws.send(JSON.stringify({ error: 'Not authenticated' }));
                logError(`Auth token spoof attempt from ${clientInfo.clientIP}`);
                ws.close();
                return;
            }
            //TODO: move Helper validation here

            // Delegate actual message handling to project-specific handler
            handleClientMessage(ws, message, clientInfo, (errMsg) => {
                ws.send(JSON.stringify({ error: errMsg }));
                logError(`${clientInfo.username}@${clientInfo.clientIP}: ${errMsg}`);
            });

        } catch (err) {
            ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
    });
}

// Internally save loginData for validation
export function initializeNewLogin(authToken: string, username: string, userID: number, clientIP: string) {
    pendingLogins.set(authToken, {
        authToken: authToken,
        username: username,
        userID: userID,
        clientIP: clientIP
    });
    logWS(`Pending login stored for ${username} (${clientIP})`);
}

// ────────── Log Connected Clients ──────────
function logConnectedClients() {
    logWS(`Total Connected Clients: (${colorizeANSI(`${authenticatedClients.size}`, 'gold')})`);

    for (const clientData of authenticatedClients.values()) {

        logSingleClient(clientData.authToken, clientData.username, clientData.userID, clientData.clientIP);

    }

    console.log('▀'.repeat(45));
}

// ────────── Helper Functions ──────────
// Pad or truncate string for consistent width
function fixedWidth(str: string | number | undefined, fixedLength = 20): string {
    const val = (str ?? '').toString();
    if (val.length > fixedLength) {
        return val.substring(0, fixedLength);
    } else {
        return val.padEnd(fixedLength, ' ');
    }
}

// Log WebSocket server events with [WS] tag
function logWS(message: string) {
    const wsTag = colorizeANSI('[WS]', 'orange');
    console.log(`${wsTag} ${message}`);
}

// Log errors with red ERROR prefix
function logError(message: string) {
    const wsTag = colorizeANSI('[WS]', 'orange');
    const errorTag = colorizeANSI('ERROR:', 'red');
    console.error(`${wsTag} ${errorTag} ${message}`);
}

// Log client data
function logSingleClient(authToken: string = "no-token", username: string = "unknown", userID: number = null, clientIP: string = "no-ip") {
    const authenticated = authToken
        ? colorizeANSI('√', 'green')
        : colorizeANSI('X', 'red');
    console.log(
        `       |> Auth:[${fixedWidth(authToken)}] [${authenticated}]\n` +
        `       |> User:[${fixedWidth(username)}]\n` +
        `       |> UID :[${fixedWidth(userID)}]\n` +
        `       |> IP:  [${fixedWidth(clientIP)}]\n`
    );
}