// functions/utils.js

// ────────── Utils Module (Frontend) ──────────
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
