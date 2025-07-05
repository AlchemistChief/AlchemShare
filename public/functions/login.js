// functions/login.js

// ────────── Custom Modules ──────────
import { saveCredentials } from "./utils.js";

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
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok && data.success && data.authToken) {
                // Save username, password, and token from backend
                saveCredentials({ username, password, authToken: data.authToken });
                onSuccessCallback();
            } else {
                alert(data.error || "Login failed");
            }
        } catch (err) {
            console.error("Login request failed", err);
            alert("Login request failed, please try again.");
        }
    });
}
