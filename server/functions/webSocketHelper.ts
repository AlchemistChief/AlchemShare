// ────────── Module Importing ──────────
import type { WebSocket } from 'ws';

// ────────── Custom Modules ──────────
import { ClientSession } from './webSocketHandler.ts'
import { sendFileList } from './webSocketHelperFunctions';

// ────────── WebSocket Helper Module ────────── (Contains project based logic)

export async function handleClientMessage(
    ws: WebSocket,
    message: any,
    clientInfo: ClientSession,
    onError: (msg: string) => void
) {
    if (!ws) return; // ws must exist
    if (!message || typeof message !== 'object') return;
    if (
        !clientInfo ||
        typeof clientInfo.authToken !== 'string' || !clientInfo.authToken ||
        typeof clientInfo.username !== 'string' || !clientInfo.username ||
        typeof clientInfo.clientIP !== 'string' || !clientInfo.clientIP
    ) {
        onError('Invalid client info');
        return;
    }

    switch (message.type) {
        case 'listFiles':
            // TODO: Implement directory reading and send file list
            sendFileList(ws, clientInfo.username, clientInfo.userID);
            break;

        default:
            onError('Unknown message type');
            return;
    }
}