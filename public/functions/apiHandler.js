// apiHandler.js

// ────────── Custom Modules ──────────
import { logClientMessage, getCredentials } from "./utils.js";

const allowedMethods = [
    "GET",
    "POST",
    "PUT",
    "DELETE"
];

const errorMessages = {
    505: "The HTTP version used in the request is not supported by the server.",
    504: "The server has timed out waiting for the request.",
    503: "The server is currently unable to handle the request due to overload or maintenance.",
    502: "The server was acting as a gateway or proxy and received an invalid response from the upstream server.",
    500: "Something went wrong on our end.",
    429: "You have sent too many requests in a short period of time.",
    418: "The server refuses the attempt to brew coffee with a teapot.",
    408: "The request took longer than the server was prepared to wait.",
    405: "The request method is recognized by the server but not supported by this resource.",
    404: "Ops! The page you are looking for doesn't exist.",
    403: "Not authorized to access this resource.",
    401: "Credentials are missing or incorrect.",
    400: "Malformed request syntax."
};

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

        if (!res.ok && res.status !== 401) { //401 Exception, let Loginhandler handle

            const data = await res.json();
            const statusPage = "../error.html";

            // Push error page to history so Back works
            window.history.pushState({}, "", statusPage);

            // Fetch and replace the current document content
            const html = await fetch(statusPage).then(r => r.text());
            const doc = new DOMParser().parseFromString(html, "text/html");

            document.head.innerHTML = doc.head.innerHTML;
            document.body.innerHTML = doc.body.innerHTML;

            document.title = `${res.status} - ${res.statusText}`;

            document.getElementById("error-code").textContent = res.status;
            document.getElementById("error-label-1").textContent = res.statusText;
            document.getElementById("error-label-2").textContent = errorMessages[res.status];
            document.getElementById("error-message").textContent = data.errorMessage || "No specific error message provided.";

            window.addEventListener("popstate", function popstateHandler() {
                window.removeEventListener("popstate", popstateHandler); // remove after firing once
                window.location.reload();
            });
        }

        // Return the raw Response to the caller
        return res;

    } catch (err) {
        logClientMessage("ERROR", `[API] ${err}`);
    }
}