// ────────── Module Importing ──────────
import type { WebSocket } from 'ws';

// ────────── Custom Modules ──────────
// ────────── WebSocket Helper Module ────────── (Contains project based logic)

export async function handleClientMessage(
    ws: WebSocket,
    message: any,
    onError: (msg: string) => void
) {
    if (!ws) return; // ws must exist
    if (!message || typeof message !== 'object') return;

    switch (message.type) {
        case 'test':
            console.log("Test message received");
            break;

        default:
            onError('Unknown message type');
            return;
    }
}