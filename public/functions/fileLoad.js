// functions/fileLoad.js

// ────────── Custom Modules ──────────
import { logClientMessage } from "./utils.js";
import { sendAPIRequest } from "./apiHandler.js";

// ────────── File Loader: Initialize and render files ──────────
const fileIcons = {
    folder: ["folder"],

    // ────── Archives ──────
    archive: ["zip", "rar", "7z", "tar", "gz", "iso"],

    // ────── Media ──────
    audio: ["mp3", "wav", "flac", "ogg", "aac", "m4a"],
    video: ["mp4", "mkv", "avi", "mov", "webm", "wmv", "flv"],
    image: ["png", "jpg", "jpeg", "gif", "bmp", "webp", "svg", "tiff", "ico"],

    // ────── Development / Code ──────
    code: [
        "js", "ts", "jsx", "tsx",
        "json", "html", "css", "scss",
        "py", "lua", "c", "cpp", "h", "hpp",
        "cs", "java", "php", "sh", "bat", "xml",
        "yml", "yaml", "toml", "env", "ini", "config",
        "ps1", "vbs", "cmd", "vdf"
    ],
    binary: ["exe", "msi", "dll", "bin", "dat"],

    // ────── Office Suite ──────
    word: ["doc", "docx"],
    excel: ["xls", "xlsx", "ods"],
    powerPoint: ["ppt", "pptx"],
    publisher: ["pub"],
    visio: ["vsd", "vsdx"],
    project: ["mpp"],
    access: ["accdb"],
    oneNote: ["one"],
    sharePoint: ["sppkg"],
    sway: ["sway"],

    // ────── Documents / Data ──────
    pdf: ["pdf"],
    database: ["db", "sqlite", "sqlite3", "sql", "mysql", "dbf"],
    text: ["txt", "log", "cfg", "csv", "md", "nfo", "readme", "rtf"],

    // ────── Default ──────
    file: []
};

// ────────── Initialize File Loader ──────────
export async function initFileLoad(currentPath = "/") {
    logClientMessage("INFO", `[FILE] Loading files at: ${currentPath}`);

    // ────── Build Breadcrumb Path Bar ──────
    const folderPathEl = document.getElementById("folder-path");
    folderPathEl.innerHTML = ""; // clear old breadcrumbs

    // Split into segments (filter removes empty parts)
    const segments = currentPath.split("/").filter(Boolean);
    let accumulatedPath = "";

    // Root clickable always exists
    const rootSpan = document.createElement("span");
    rootSpan.textContent = "Root";
    rootSpan.classList.add("breadcrumb");
    rootSpan.onclick = () => initFileLoad("/");
    folderPathEl.appendChild(rootSpan);

    // Add intermediate directories
    segments.forEach((segment, index) => {
        accumulatedPath += "/" + segment;

        // Separator
        const separator = document.createElement("span");
        separator.textContent = " / ";
        folderPathEl.appendChild(separator);

        const span = document.createElement("span");
        span.textContent = segment;
        span.classList.add("breadcrumb");
        span.onclick = () => {
            // Go to the clicked directory level
            const targetPath = segments
                .slice(0, index + 1)
                .join("/")
                .replace(/^/, "/");
            initFileLoad(targetPath);
        };
        folderPathEl.appendChild(span);
    });

    // Optional: Add a Back button at the start
    const backButton = folderPathEl.querySelector("button");
    if (backButton) {
        backButton.onclick = () => {
            const parent = currentPath.replace(/\/[^/]+\/?$/, "") || "/";
            initFileLoad(parent);
        };
    }

    // ────── Request Directory Listing ──────
    const response = await sendAPIRequest({
        method: "POST",
        endpoint: "/listfiles",
        message: { path: currentPath }
    });

    const data = await response.json();
    const tableBody = document.getElementById("fileTableBody");
    tableBody.innerHTML = ""; // clear old entries

    // ────── List Directory Items ──────
    data.files.forEach((file, index) => {
        const fileName = file.name;
        const fileExtension = fileName.split(".").pop().toLowerCase();

        // ────── Detect File Category ──────
        let fileCategory = "file"; // default icon
        for (const [category, extensions] of Object.entries(fileIcons)) {
            if (extensions.includes(fileExtension)) {
                fileCategory = category;
                break;
            }
        }

        // ────── Build Table Row ──────
        const row = document.createElement("tr");
        row.classList.add("ftp-row");
        row.dataset.id = (index + 1).toString();

        const iconName = file.isDirectory ? "folder" : fileCategory;
        const sizeDisplay = file.isDirectory ? "-" : file.size;
        const typeDisplay = file.isDirectory ? "folder" : file.type;

        row.innerHTML = `
            <td>
                <img src="/assets/file-icons/${iconName}.png" alt="${iconName}">
                ${fileName}
            </td>
            <td style="font-family: monospace;">${typeDisplay}</td>
            <td style="font-family: monospace; text-align: right;">${sizeDisplay}</td>
            <td style="font-family: monospace;">${file.lastModified}</td>
        `;

        // ────── Folder Navigation ──────
        if (file.isDirectory) {
            row.classList.add("folder-row");
            row.onclick = () => {
                const nextPath =
                    currentPath.endsWith("/")
                        ? currentPath + file.name
                        : currentPath + "/" + file.name;
                initFileLoad(nextPath);
            };
        }

        tableBody.appendChild(row);
    });

    // ────── Initialize Context Menu ──────
    const { initContextMenu } = await import("./contextMenu.js");
    initContextMenu();
}