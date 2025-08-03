// ────────── Module Importing ──────────
import type { WebSocket } from 'ws';

// ────────── Custom Modules ──────────
// ────────── WebSocket Helper Module ──────────

export async function handleClientMessage(
    ws: WebSocket,
    message: any,
    clientInfo: { username?: string; authToken?: string; clientIp?: string },
    onError: (msg: string) => void
) {
    if (!ws) return; // ws must exist
    if (!message || typeof message !== 'object') return;
    if (
        !clientInfo ||
        typeof clientInfo.username !== 'string' || !clientInfo.username ||
        typeof clientInfo.authToken !== 'string' || !clientInfo.authToken ||
        typeof clientInfo.clientIp !== 'string' || !clientInfo.clientIp
    ) {
        onError('Invalid client info');
        return;
    }

    switch (message.type) {
        case 'auth':
            //TODO: Implement authentication
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
            onError('Unknown message type');
            return;
    }
}