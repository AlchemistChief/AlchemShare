// functions/fileLoad.js

// ────────── Custom Modules ──────────
import { logClientMessage } from "./utils.js";
import { sendAPIRequest } from "./apiHandler.js";

// ────────── File Loader: Initialize and render files ──────────
export async function initFileLoad() {
    logClientMessage("INFO", "[FILE] Loading files...");

    const response = await sendAPIRequest({ method: "GET", endpoint: "/listfiles" });
    const data = await response.json();

    const tableBody = document.getElementById("fileTableBody");
    tableBody.innerHTML = ""; // clear old entries

    data.files.forEach((file, index) => {
        // file = { path, size, lastModified, type }
        const fileName = file.path.split(/[/\\]/).pop();

        // Create row
        const row = document.createElement("tr");
        row.classList.add("ftp-row");
        row.dataset.id = (index + 1).toString();

        // Insert cells with metadata
        row.innerHTML = `
            <td>${fileName}</td>
            <td style="font-family: monospace;">${file.type}</td>
            <td style="font-family: monospace; text-align: right;">${file.size}</td>
            <td style="font-family: monospace;">${file.lastModified}</td>
        `;

        tableBody.appendChild(row);
    });

    const { initContextMenu } = await import("./contextMenu.js");
    initContextMenu();
}