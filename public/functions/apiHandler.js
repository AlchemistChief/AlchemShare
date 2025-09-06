// apiHandler.js

// ────────── Custom Modules ──────────
import { logClientMessage, getCredentials } from "./utils.js";

const allowedMethods = [
    "GET",
    "POST",
    "PUT",
    "DELETE"
];

export async function sendAPIRequest({ method = "GET", endpoint = "ping", message = {} }) {
    method = method.toUpperCase();

    if (!allowedMethods.includes(method)) {
        logClientMessage("ERROR", `Method ${method} is not allowed.`);
    }

    logClientMessage("INFO", `[API] ${method} ${endpoint}`);

    const fetchOptions = {
        method: method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": getCredentials().authToken || ""
        }
    };

    if (method !== "GET") {
        fetchOptions.body = JSON.stringify({ message });
    }

    return fetch(`/api${endpoint}`, fetchOptions)
        .then(res => {
            return res;
        })
        .catch(err => {
            logClientMessage("ERROR", `[API] ${err}`);
            throw err;
        });
}
