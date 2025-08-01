  // functions/utils.js

  // ────────── Credentials Module (Frontend) ──────────
let savedCredentials = {
    username : null,
    password : null,
    authToken: null,
};

export function saveCredentials({ username, password, authToken }) {
    savedCredentials.username  = username;
    savedCredentials.password  = password;
    savedCredentials.authToken = authToken;
}

export function getCredentials() {
    return { ...savedCredentials };
}

  // ────────── Logger Function ──────────
export function logClientMessage(type = "INFO", message) {
    const upperType = type.toUpperCase();

      // Prefixes and Colors by Log Type
    const prefixMap = {
        INFO   : "[INFO]   ",
        DEBUG  : "[DEBUG]  ",
        ERROR  : "[ERROR]  ",
        SUCCESS: "[SUCCESS]",
        WARNING: "[WARNING]",
    };

    const prefix = prefixMap[upperType] || "[LOG]";

      // Final formatted message
    console.log(`${prefix} ${message}`);

      // Trigger alert on ERROR in browser
    if (typeof window !== 'undefined' && typeof alert === 'function') {
        if (upperType === "ERROR") {
            alert(`ERROR: ${message}`);
        }
        else if (upperType === "WARNING") {
            alert(`WARNING: ${message}`);
        }
    }
};
