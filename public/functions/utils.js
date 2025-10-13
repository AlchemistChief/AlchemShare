// functions/utils.js

// ────────── Credentials Module (Frontend) ──────────
let savedCredentials = {
  authToken: null,
  username: null,
  password: null,
  userID: null,
  permissions: [],
};

export function saveCredentials({ authToken, username, password, userID, permissions }) {
  savedCredentials.authToken = authToken;
  savedCredentials.username = username;
  savedCredentials.password = password;
  savedCredentials.userID = userID;
  savedCredentials.permissions = permissions || [];
}


export function getCredentials() {
  return { ...savedCredentials };
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
