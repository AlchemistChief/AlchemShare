// functions/loginHandler.js

// ────────── Custom Modules ──────────
import { logClientMessage, saveCredentials } from "./utils.js";
import { webSocketInitialize } from "./webSocketHandler.js";

// ────────── Login Module ──────────
export function initLogin(onSuccessCallback) {
    const loginForm = document.querySelector(".login-form");
    if (!loginForm) {
        console.error("Login form not found");
        return;
    }

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = loginForm.username.value.trim();
        const password = loginForm.password.value;

        if (!username || !password) {
            alert("Please fill in both fields.");
            return;
        }

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                }),
            });

            const data = await response.json();

            if (response.ok && data.success && data.authToken && data.userID && data.permissions) {
                // Save username, password, token, userID, and permissions from backend
                saveCredentials({
                    authToken: data.authToken,
                    username: username,
                    password: password,
                    userID: data.userID,
                    permissions: data.permissions
                });

                onSuccessCallback();

                // Optionally log for debugging
                logClientMessage(`Logged in as ${username} (ID: ${data.userID}) with permissions: ${data.permissions.join(", ")}`);

                webSocketInitialize();
            } else {
                alert(data.error || "Login failed");
            }
        } catch (err) {
            console.error("Login request failed", err);
            alert("Login request failed, please try again.");
        }
    });
}
