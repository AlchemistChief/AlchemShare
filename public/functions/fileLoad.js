// functions/fileLoad.js

// ────────── Custom Modules ──────────
import { logClientMessage } from "./utils.js";
import { sendAPIRequest } from "./apiHandler.js";

export async function initFileLoad() {
    logClientMessage("INFO", "[FILE] Loading files...");
    const response = await sendAPIRequest({ method: "GET", endpoint: "/listfiles" });
    const data = await response.json();
}
