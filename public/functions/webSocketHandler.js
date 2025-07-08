// functions/webSocketHandler.js

// ────────── Custom Modules ──────────
import { logClientMessage, getCredentials } from "./utils.js";

// ────────── WebSocket Handler Module ──────────
let ws = null;

export function webSocketInitialize() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        logClientMessage("WARNING", "WebSocket already connected", true);
        return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const url = `${protocol}//${host}`;

    ws = new WebSocket(url);

    ws.onopen = () => {
        logClientMessage("SUCCESS", "WebSocket connected", true);
        sendMessage({ type: "auth" });
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        logClientMessage("DEBUG", `WS message received: ${JSON.stringify(data)}`, true);
    };

    ws.onerror = (err) => {
        logClientMessage("ERROR", `WebSocket error: ${err.message}`, true);
    };

    ws.onclose = (event) => {
        logClientMessage("DEBUG", `WebSocket closed (code: ${event.code})`, true);
    };
}

export function sendMessage(message) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        logClientMessage("ERROR", "WebSocket is not open. Cannot send message.", true);
        return;
    }

    const { username, password, authToken } = getCredentials();

    const payload = {
        authToken,
        username,
        password,
        message,
    };

    ws.send(JSON.stringify(payload));
    logClientMessage("DEBUG", `Message sent: ${JSON.stringify(payload)}`, true);
}

export function closeWebSocket() {
    if (ws) ws.close();
}