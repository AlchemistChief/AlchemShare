// index.js

// ────────── Custom Modules ──────────
import { initLogin } from "./functions/loginHandler.js";

// ────────── Index Main ──────────
document.addEventListener("DOMContentLoaded", () => {
    //initLogin(onLoginSuccess);
    const host = window.location.hostname;
    const protocol = window.location.protocol;

    // Detect if running in VSCode Live Preview
    const isVSCodeLivePreview =
        host.includes("127.0.0.1") ||
        host.includes("localhost") ||
        protocol === "vscode-webview:";

    if (isVSCodeLivePreview) {
        console.log("Running inside VSCode Live Preview");
        onLoginSuccess();
    } else {
        console.log("Running in normal browser");
        initLogin(onLoginSuccess);
    }
});

async function onLoginSuccess() {
    // Change page title
    document.title = "AlchemShare - Home";
    
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

    const { initFileLoad } = await import("./functions/fileLoad.js");
    initFileLoad();
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