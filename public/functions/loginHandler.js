// functions/loginHandler.js

// ────────── Custom Modules ──────────
import { logClientMessage, saveCredentials } from "./utils.js";
import { sendAPIRequest } from "./apiHandler.js";

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
            const res = await sendAPIRequest({method: "POST", endpoint: "/login", message: {
                username: username,
                password: password
            }});

            // Return if response error
            if (!res.ok && res.status !== 401) return;

            const data = await res.json();

            if (!data.success || !data.authToken || !data.userID || !data.permissions) {
                const errorMessage = document.getElementById("error-message")
                errorMessage.textContent = `Login failed:\n${res.statusText} - ${data.errorMessage}`;
                errorMessage.style.display = "block";
                return;
            }

            saveCredentials({
                authToken: data.authToken,
                username: username,
                password: password,
                userID: data.userID,
                permissions: data.permissions
            });

            onSuccessCallback();

            // Optionally log for debugging
            logClientMessage("INFO", `Logged in as ${username} (ID: ${data.userID}) with permissions: ${data.permissions.join(", ")}`);

        } catch (err) {
            console.error("Login request failed", err);
        }
    });
}
