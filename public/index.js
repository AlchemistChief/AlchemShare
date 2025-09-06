// index.js

// ────────── Custom Modules ──────────
import { initLogin } from "./functions/loginHandler.js";

// ────────── Index Main ──────────
document.addEventListener("DOMContentLoaded", () => {
    initLogin(onLoginSuccess);
});

async function onLoginSuccess() {
    // Hide login screen
    const loginContainer = document.querySelector(".login-container");
    if (loginContainer) loginContainer.remove();

    // Show app container
    const appContainer = document.querySelector(".app-container");
    if (appContainer) appContainer.style.display = "flex";

    // Load layout-related CSS
    await loadCss("./css/layout.css");
    await loadCss("./css/table.css");
    await loadCss("./css/components.css");
    await loadCss("./css/contextMenu.css");

    // Dynamically load JS modules
    const { initializeWebSocket } = await import("./functions/webSocketHandler.js");
    initializeWebSocket();

    const { initContextMenu } = await import("./functions/contextMenu.js");
    initContextMenu();
}

function loadCss(href) {
    return new Promise((resolve, reject) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.onload = resolve;
        link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
        document.head.appendChild(link);
    });
}

// ────────── Service Worker Registration ──────────
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/service-worker.js")
            .then(registration => {
                console.log("✅ Service Worker registered at:", registration.scope);
            })
            .catch(error => {
                console.error("❌ Service Worker registration failed:", error);
            });
    });
}