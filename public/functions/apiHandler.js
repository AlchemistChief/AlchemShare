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

    try {
        const res = await fetch(`/api${endpoint}`, fetchOptions);

        if (!res.ok) {
            const data = await res.json();
            if (data.page) {
                const url = data.error
                    ? `${data.page}?errorMessage=${encodeURIComponent(data.error)}`
                    : data.page;
                window.location.href = url;
                return;
            }
        }

        // Return the raw Response to the caller
        return res;

    } catch (err) {
        logClientMessage("ERROR", `[API] ${err}`);
    }
}