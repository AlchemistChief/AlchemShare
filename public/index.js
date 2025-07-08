// index.js

// ────────── Custom Modules ──────────
import { initLogin } from "./functions/loginHandler.js";

// ────────── Index Main ──────────
document.addEventListener("DOMContentLoaded", () => {
    initLogin(onLoginSuccess);
    //onLoginSuccess()
});

async function onLoginSuccess() {
    // Hide login screen
    const loginContainer = document.querySelector(".login-container");
    //if (loginContainer) remove loginContainer
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
    const { webSocketInitialize } = await import("./functions/webSocketHandler.js");
    const { initContextMenu } = await import("./functions/contextMenu.js");
    webSocketInitialize();
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
