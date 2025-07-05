// functions/webSocketHandler.js

// ────────── Custom Modules ──────────
import { getCredentials } from "./utils.js";

// ────────── WebSocket Handler Module ──────────
let ws = null;

export function webSocketInitialize() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        console.warn("WebSocket already connected");
        return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host; // hostname + port
    const url = `${protocol}//${host}`;

    ws = new WebSocket(url);

    ws.onopen = () => {
        console.log("WebSocket connected");
        sendMessage({ type: "auth" });
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("WS message received:", data);
    };

    ws.onerror = (err) => {
        console.error("WebSocket error:", err);
    };

    ws.onclose = (event) => {
        console.log(`WebSocket closed (code: ${event.code})`);
    };
}

export function sendMessage(messageObj) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.warn("WebSocket is not open. Cannot send message.");
        return;
    }

    const { username, password, authToken } = getCredentials();

    const payload = {
        authToken,
        username,
        password,
        message: messageObj,
    };

    ws.send(JSON.stringify(payload));
}

export function closeWebSocket() {
    if (ws) ws.close();
}
