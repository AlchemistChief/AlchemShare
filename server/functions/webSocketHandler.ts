// ────────── Module Importing ──────────
import { WebSocketServer , WebSocket } from 'ws';

// ────────── Custom Modules ──────────
// ────────── WebSocket Handler Module ──────────

interface WSMessage {
    authToken?: string;
    username?: string;
    password?: string;
    message: any;
}

// WebSocket server instance
let wss: WebSocketServer | null = null;

// Store authenticated clients here
const authenticatedClients = new Map<WebSocket, { username: string; authToken: string; ip: string }>();

function validateAuth(username: string, password: string, authToken: string): boolean {
    // Simple check for presence — replace with real validation
    return !!username && !!password && !!authToken;
}

export function initializeWebSocketServer(server: any) {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws: WebSocket, req) => {
        // Clean IP: remove IPv6 prefix ::ffff: if present
        let ip = req.socket.remoteAddress || 'unknown-ip';
        if (ip.startsWith('::ffff:')) {
            ip = ip.substring(7);
        }

        console.log('[WS] Client Connected');

        ws.on('message', (data) => {
            try {
                const parsed: WSMessage = JSON.parse(data.toString());

                const { username, password, authToken, message } = parsed;

                // Validate credentials on every message
                if (!validateAuth(username, password, authToken)) {
                    ws.send(JSON.stringify({ error: 'Authentication failed' }));
                    ws.close();
                    return;
                }

                // Mark client authenticated
                if (!authenticatedClients.has(ws)) {
                    authenticatedClients.set(ws, { username, authToken, ip });
                    console.log(`       | [${authToken}] [${ip}] [${username}]`);
                    logConnectedClients();
                }

                // Handle client message
                handleClientMessage(ws, message);
            } catch (err) {
                console.error('[WS] WS message parse error:', err);
                ws.send(JSON.stringify({ error: 'Invalid message format' }));
            }
        });

        ws.on('close', () => {
            const clientData = authenticatedClients.get(ws);
            if (clientData) {
                console.log(`[WS] Client Disconnected`);
                console.log(`       | [${clientData.authToken}] [${clientData.ip}] [${clientData.username}]`);
            } else {
                console.log('[WS] Client Disconnected | [unknown client]');
            }

            authenticatedClients.delete(ws);
            logConnectedClients();
        });
    });
}

// ────────── Log Connected Clients ──────────
function logConnectedClients() {
    console.log(`[WS] Total Connected Clients: (${authenticatedClients.size})`);

    let maxLineLength = 0;

    for (const clientData of authenticatedClients.values()) {
        const line = `       | [${clientData.authToken}] [${clientData.ip}] [${clientData.username}]`;
        console.log(line);
        if (line.length > maxLineLength) maxLineLength = line.length;
    }

    if (maxLineLength > 0) {
        console.log('▔'.repeat(maxLineLength));
    }
}

function handleClientMessage(ws: WebSocket, message: any) {
    if (!message || typeof message !== 'object') return;

    switch (message.type) {
        case 'auth':
            ws.send(JSON.stringify({ type: 'auth', success: true }));
            break;

        case 'listFiles':
            // TODO: Implement directory reading and send file list
            ws.send(
                JSON.stringify({
                    type: 'listFiles',
                    files: [], // placeholder empty list
                })
            );
            break;

        default:
            ws.send(JSON.stringify({ error: 'Unknown message type' }));
            break;
    }
}