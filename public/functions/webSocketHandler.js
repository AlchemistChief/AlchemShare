// functions/webSocketHandler.js

// ────────── Custom Modules ──────────
import { logClientMessage, getCredentials } from "./utils.js";

// ────────── WebSocket Handler Module ──────────
let ws = null;

export function webSocketInitialize() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        logClientMessage("WARNING", "[WS] WebSocket already connected");
        return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const url = `${protocol}//${host}`;

    ws = new WebSocket(url);

    ws.onopen = () => {
        logClientMessage("SUCCESS", "[WS] WebSocket connected");
        const { username, userID } = getCredentials();
        sendMessage({
            type: "auth",
            username: username,
            userID: userID
        });
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        logClientMessage("DEBUG", `[WS] Message received: ${JSON.stringify(data)}`);
    };

    ws.onerror = (err) => {
        logClientMessage("ERROR", `[WS] WebSocket error: ${err.message}`);
    };

    ws.onclose = (event) => {
        logClientMessage("DEBUG", `[WS] WebSocket closed (code: ${event.code})`);
    };
}

export function sendMessage(message) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        logClientMessage("ERROR", "[WS] WebSocket is not open. Cannot send message.");
        return;
    }

    const { authToken } = getCredentials();

    const payload = {
        authToken: authToken,
        message: message,
    };

    ws.send(JSON.stringify(payload));
    logClientMessage("DEBUG", `[WS] Message sent: ${JSON.stringify(payload)}`);
}