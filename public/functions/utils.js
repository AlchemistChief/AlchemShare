// functions/utils.js

// ────────── Credentials Module (Frontend) ──────────
const STORAGE_KEY = "savedCredentials";

// Initialize copy from sessionStorage if available
let savedCredentials = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {
  authToken: null,
  username: null,
  password: null,
  userID: null,
  permissions: [],
};

export function saveCredentials({ authToken, username, password, userID, permissions }) {
  savedCredentials = {
    authToken: authToken,
    username: username,
    password: password,
    userID: userID,
    permissions: permissions || [],
  };

  // Persist to sessionStorage
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(savedCredentials));
}

export function getCredentials() {
  // Always return latest from sessionStorage in case of page reload
  savedCredentials = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || savedCredentials;
  return { ...savedCredentials };
}

export function clearCredentials() {
  savedCredentials = {
    authToken: null,
    username: null,
    password: null,
    userID: null,
    permissions: [],
  };
  sessionStorage.removeItem(STORAGE_KEY);
}


// ────────── Logger Function ──────────
export function logClientMessage(type = "INFO", message) {
  const upperType = type.toUpperCase();

  const styleMap = {
    INFO: 'color: dodgerblue; font-weight: bold',
    DEBUG: 'color: yellow; font-weight: bold',
    ERROR: 'color: red; font-weight: bold',
    SUCCESS: 'color: green; font-weight: bold',
    WARNING: 'color: orange; font-weight: bold',
  };

  const prefixMap = {
    INFO: '[INFO]   ',
    DEBUG: '[DEBUG]  ',
    ERROR: '[ERROR]  ',
    SUCCESS: '[SUCCESS]',
    WARNING: '[WARNING]',
  };

  const prefix = prefixMap[upperType] || '[LOG]';
  const style = styleMap[upperType] || 'color: black';

  // Apply style only to the prefix
  console.log(`%c${prefix}%c ${message}`, style, '');

  // Trigger alert on ERROR in browser
  if (typeof window !== 'undefined' && typeof alert === 'function') {
    if (upperType === 'ERROR') {
      alert(`ERROR: ${message}`);
    } else if (upperType === 'WARNING') {
      alert(`WARNING: ${message}`);
    }
  }
}
