// ────────── Module Importing ──────────
import { WebSocketServer, WebSocket } from 'ws';

// ────────── Custom Modules ──────────
import { handleClientMessage } from './webSocketHelper.ts'
import { colorizeANSI } from './utils.ts';

// ────────── WebSocket Handler Module ──────────

interface WSMessage {
    authToken: string;
    message: any;
}

// Internal authenticated client record
interface ClientSession {
    username: string;
    authToken: string;
    clientIp: string;
    authenticated: boolean;
}

let wss: WebSocketServer | null = null;

// Store authenticated clients keyed by their WebSocket instance
const authenticatedClients = new Map<WebSocket, ClientSession>();

export function initializeWebSocketServer(server: any) {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws: WebSocket, req) => {
        // Extract and normalize client IP address
        let clientIp = req.socket.remoteAddress || 'unknown-ip';
        if (clientIp.startsWith('::ffff:')) {
            clientIp = clientIp.substring(7);
        }

        // Add unauthenticated client session immediately for tracking
        authenticatedClients.set(ws, {
            username: '',
            authToken: '',
            clientIp,
            authenticated: false
        });

        // Authenticate client on first message only
        ws.once('message', (data) => {
            try {
                const parsed: WSMessage = JSON.parse(data.toString());
                const { authToken, message } = parsed;

                // Basic message format and auth data validation
                if (!message || message.type !== 'auth' || !message.username) {
                    ws.send(JSON.stringify({ error: 'Invalid authentication format' }));
                    ws.close();
                    return;
                }

                const { username } = message;

                // Ensure authToken and username exist
                if (!username || !authToken) {
                    ws.send(JSON.stringify({ error: 'Authentication failed' }));
                    ws.close();
                    return;
                }

                // Prevent duplicate connections using same username or token
                const existingSession = [...authenticatedClients.values()].find(s =>
                    s.authenticated && (s.authToken === authToken || s.username === username)
                );
                if (existingSession) {
                    ws.send(JSON.stringify({ error: 'Duplicate session' }));
                    ws.close();
                    return;
                }

                // Mark client as authenticated
                authenticatedClients.set(ws, {
                    username,
                    authToken,
                    clientIp,
                    authenticated: true
                });

                // Log successful authentication with colorized output
                logWS('Client Connected [Authenticated]');
                console.log(
                    `       |> Auth:[${fixedWidth(authToken)}] [${colorizeANSI('√', { color: 'green', weight: 'bold' })}]\n` +
                    `       |> IP:  [${fixedWidth(clientIp)}]\n` +
                    `       |> User:[${fixedWidth(username)}]`
                );
                logConnectedClients()

                // Start listening for all subsequent messages
                setupMessageListener(ws);

            } catch (err) {
                ws.send(JSON.stringify({ error: 'Invalid message format' }));
                ws.close();
            }
        });

        ws.on('close', () => {
            const clientData = authenticatedClients.get(ws);
            if (clientData?.authenticated) {
                logWS('Client Disconnected');
                console.log(`       |> [${clientData.authToken}] [${clientData.clientIp}] [${clientData.username}]`);
            } else {
                logWS('Client Disconnected | [unauthenticated]');
            }
            // Remove client session on disconnect
            authenticatedClients.delete(ws);
            logConnectedClients();
        });
    });
};

// ────────── Permanent Message Listener ──────────
function setupMessageListener(ws: WebSocket) {
    ws.on('message', (data) => {
        try {
            const parsed: WSMessage = JSON.parse(data.toString());
            const { authToken, message } = parsed;

            const clientInfo = authenticatedClients.get(ws);

            // Ensure client is authenticated before processing
            if (!clientInfo || !clientInfo.authenticated) {
                ws.send(JSON.stringify({ error: 'Not authenticated' }));
                ws.close();
                return;
            }

            // Prevent spoofing by validating authToken on every message
            if (authToken !== clientInfo.authToken) {
                ws.send(JSON.stringify({ error: 'Authentication token mismatch' }));
                logError(`Auth token spoof attempt from ${clientInfo.clientIp}`);
                ws.close();
                return;
            }

            // Delegate actual message handling to project-specific handler
            handleClientMessage(ws, message, clientInfo, (errMsg) => {
                ws.send(JSON.stringify({ error: errMsg }));
                logError(`${clientInfo.username}@${clientInfo.clientIp}: ${errMsg}`);
            });

        } catch (err) {
            ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
    });
}

// ────────── Log Connected Clients ──────────
function logConnectedClients() {
    logWS(`Total Connected Clients: (${authenticatedClients.size})`);

    for (const clientData of authenticatedClients.values()) {
        const username = clientData.username || 'unknown';
        const authToken = clientData.authToken || 'no-token';
        const clientIp = clientData.clientIp || 'no-ip';

        const authenticated = clientData.authenticated == true
            ? colorizeANSI('√', { color: 'green', weight: 'bold' })
            : colorizeANSI('X', { color: 'red', weight: 'bold' });

        const line =
            `       |> Auth:[${fixedWidth(authToken)}] [${authenticated}]\n` +
            `       |> IP:  [${fixedWidth(clientIp)}]\n` +
            `       |> User:[${fixedWidth(username)}]`;

        console.log(line);
    }

    console.log('▀'.repeat(45));
}

// ────────── Helper Functions ──────────
// Pad or truncate string for consistent width
function fixedWidth(str: string | undefined, fixedLength = 20): string {
    const val = (str ?? '').toString();
    if (val.length > fixedLength) {
        return val.substring(0, fixedLength);
    } else {
        return val.padEnd(fixedLength, ' ');
    }
}

// Log WebSocket server events with [WS] tag
function logWS(message: string) {
    const wsTag = colorizeANSI('[WS]', { color: 'orange', weight: 'bold' });
    console.log(`${wsTag} ${message}`);
}

// Log errors with bold red ERROR prefix
function logError(message: string) {
    const wsTag = colorizeANSI('[WS]', { color: 'orange', weight: 'bold' });
    const errorTag = colorizeANSI('ERROR:', { color: 'red', weight: 'bold' });
    console.error(`${wsTag} ${errorTag} ${message}`);
}