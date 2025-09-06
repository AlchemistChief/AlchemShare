// ────────── Module Importing ──────────
import { WebSocketServer } from 'ws';
import type { WebSocket } from 'ws';
import type { Server } from 'https';

// ────────── Custom Modules ──────────
import { handleClientMessage } from './webSocketHelper.ts'
import { colorizeANSI } from './utils.ts';

// ────────── WebSocket Handler Module ────────── (Contains famework logic) //todo: Add automatic removal of uanauthenticated connections
// Authenticated client record
export interface ClientSession {
    authToken: string;
    username: string;
    userID: number;
    clientIP: string;
    webSocket: WebSocket | null;
};

let wss: WebSocketServer;

// Store clients keyed by authToken
const authenticatedClients = new Map<string, ClientSession>();

export function initializeWebSocketServer(server: Server) {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws: WebSocket, req) => {
        // Extract and normalize client IP address
        let clientIP = req.socket.remoteAddress || 'unknown-ip';
        if (clientIP.startsWith('::ffff:')) {
            clientIP = clientIP.substring(7);
        }

        if (!clientIP) {
            ws.close();
        }

        // Authenticate client on first message only, further messages handled by other listener
        ws.once('message', (data) => {
            try {
                const { authToken, message } = JSON.parse(data.toString());

                // Ensure message is an auth request
                if (!message || message.type !== 'auth' || !authToken) {
                    ws.send(JSON.stringify({ error: 'Invalid authentication format' }));
                    ws.close();
                    return;
                }

                // Lookup pending login by token
                const clientInstance = authenticatedClients.get(authToken);
                if (!clientInstance) {
                    ws.send(JSON.stringify({ error: 'No pending login for this token' }));
                    ws.close();
                    return;
                }

                // Check consistency between pending login and client message
                if (
                    clientIP !== clientInstance.clientIP
                ) {
                    ws.send(JSON.stringify({ error: 'Authentication data mismatch' }));
                    ws.close();
                    logError(`Mismatch for token "${authToken}" from ${clientIP}`);
                    return;
                }

                // Update client entry
                clientInstance.webSocket = ws;

                // Log success
                logWS(`Client ${colorizeANSI('Connected', 'green')} | [${colorizeANSI('Authenticated', 'green')}]`);
                logSingleClient(authToken, clientInstance.username, clientInstance.userID, clientInstance.clientIP);
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
            const clientData = [...authenticatedClients.values()].find(clientInstance => clientInstance.webSocket === ws);

            if (clientData?.authToken) {
                logWS(`Client ${colorizeANSI('Disconnected', 'red')} | [${colorizeANSI('Authenticated', 'green')}]`);
                logSingleClient(clientData.authToken, clientData.username, clientData.userID, clientData.clientIP);
                authenticatedClients.delete(clientData.authToken);
            } else {
                logWS(`Client ${colorizeANSI('Disconnected', 'red')} | [${colorizeANSI('Unauthenticated', 'red')}]`);
            }

            logConnectedClients();
        });
    });
}

// ────────── Permanent Message Listener ──────────
function setupMessageListener(ws: WebSocket) {
    ws.on('message', (data) => {
        try {
            const { authToken, message } = JSON.parse(data.toString());

            const clientInstance = authenticatedClients.get(authToken);

            // PValidate authToken on every message
            if (authToken !== clientInstance.authToken) {
                ws.send(JSON.stringify({ error: 'Not authenticated' }));
                ws.close();
                logError(`Invalid authToken from ${clientInstance.clientIP}`);
                return;
            }

            // Redirect actual message handling to project-specific handler
            handleClientMessage(ws, message, (errMsg) => {
                ws.send(JSON.stringify({ error: errMsg }));
                logError(`${clientInstance.username}@${clientInstance.clientIP}: ${errMsg}`);
            });

        } catch (err) {
            ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
    });
}

// ────────── Internally Save Account Data ──────────
export function initializeNewLogin(authToken: string, username: string, userID: number, clientIP: string) {
    authenticatedClients.set(authToken, {
        authToken: authToken,
        username: username,
        userID: userID,
        clientIP: clientIP,
        webSocket: null
    });
    logWS(`Pending login stored for ${username} (${clientIP})`);
}

// ────────── Export Internally Saved Account Data ──────────
export function getAuthenticatedClientData(authToken: string): ClientSession {
    try {
        return authenticatedClients.get(authToken)
    } catch (err) {
        logError(`Failed to get client data for token "${authToken}": ${err}`);
    }
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

// Log errors with red [ERROR] prefix
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