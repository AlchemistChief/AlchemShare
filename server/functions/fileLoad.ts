// ────────── Module Importing ──────────
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

// ────────── Custom Modules ──────────
import { getAuthenticatedClientData } from './webSocketHandler.ts';
import { formatFileSize, formatDate } from './utils.ts';

// ────────── File Load Module ──────────
// Sends a non-recursive list of files & folders inside the given path
export function getFileList(req: Request, res: Response, authToken: string) {
    const userID = getAuthenticatedClientData(authToken).userID;
    const relativePath = req.body.message.path || "/";

    const userDirectory = path.join(import.meta.dirname, '../../files', `ID_${userID}`);
    const targetDir = path.normalize(path.join(userDirectory, relativePath));

    try {
        // Prevent directory traversal
        if (!targetDir.startsWith(userDirectory)) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        // Ensure the directory exists
        fs.mkdirSync(targetDir, { recursive: true });

        // Get contents of that directory (non-recursive)
        const items = fs.readdirSync(targetDir);
        const files = items.map(item => {
            const fullPath = path.join(targetDir, item);
            const stats = fs.statSync(fullPath);

            return {
                name: item,
                isDirectory: stats.isDirectory(),
                size: stats.isDirectory() ? null : formatFileSize(stats.size),
                lastModified: formatDate(stats.mtime),
                type: stats.isDirectory() ? "folder" : (path.extname(item).slice(1).toLowerCase() || "unknown")
            };
        });

        res.status(200).json({ path: relativePath, files });
    } catch (err: any) {
        throw Object.assign(new Error(`${err.message}`), { status: 500 });
    }
}
