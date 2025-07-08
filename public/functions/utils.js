// functions/utils.js

// ────────── Credentials Module (Frontend) ──────────
let savedCredentials = {
    username: null,
    password: null,
    authToken: null,
};

export function saveCredentials({ username, password, authToken }) {
    savedCredentials.username = username;
    savedCredentials.password = password;
    savedCredentials.authToken = authToken;
}

export function getCredentials() {
    return { ...savedCredentials };
}

// ────────── Logger Function ──────────
export function logMessage(type = "INFO", message, fromWebSocket = false) {
    const upperType = type.toUpperCase();

    // Prefixes and Colors by Log Type
    const prefixMap = {
        INFO:   "[INFO]   ",
        DEBUG:  "[DEBUG]  ",
        ERROR:  "[ERROR]  ",
        SUCCESS:"[SUCCESS]"
    };

    const prefix = prefixMap[upperType] || "[LOG]";

    // Format WebSocket tag if needed
    const wsTag = fromWebSocket ? "[WS] " : "";

    // Final formatted message
    console.log(`${prefix} ${wsTag}${message}`);

    // Trigger alert on ERROR in browser
    if (upperType === "ERROR") {
        if (typeof window !== 'undefined' && typeof alert === 'function') {
            alert(`ERROR: ${message}`);
        }
    }
}
