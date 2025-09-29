// ────────── Module Importing ──────────
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

// ────────── Custom Modules ──────────
import { getAuthenticatedClientData } from './webSocketHandler.ts';
import { formatFileSize, formatDate } from './utils.ts';

// ────────── File Load Module ──────────
// Sends a flat list of relative file paths for a user directory
export function getFileList(req: Request, res: Response, authToken: string) {
    const userID = getAuthenticatedClientData(authToken).userID;

    const userDirectory = path.join(import.meta.dirname, '../../files', `ID_${userID}`);

    try {
        // Ensure the directory exists, create one if not
        fs.mkdirSync(userDirectory, { recursive: true });

        // Respond with the list of relative file paths
        const files = getAllFilesRelative(userDirectory);
        res.status(200).json({ files });
    } catch (err: any) {
        throw Object.assign(new Error(`${err.message}`), { status: 500 });
    }
}

// ────────── Helper: Recursively get all relative file paths ──────────
function getAllFilesRelative(dir: string, baseDir = dir): {
    path: string;
    size: string;
    lastModified: string;
    type: string;
}[] {
    let results: any[] = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            // Recurse into subdirectories
            results = results.concat(getAllFilesRelative(fullPath, baseDir));
        } else {
            results.push({
                path: path.relative(baseDir, fullPath),
                size: formatFileSize(stats.size),
                lastModified: formatDate(stats.mtime),
                type: path.extname(item).slice(1).toLowerCase() || 'unknown'
            });
        }
    }

    return results;
}
