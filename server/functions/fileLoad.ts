// ────────── Module Importing ──────────
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

// ────────── Custom Modules ──────────
import { getAuthenticatedClientData } from './webSocketHandler.ts';

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
        res.status(500).json({ error: err.message, files: [] });
    }
}

// ────────── Helper: Recursively get all relative file paths ──────────
function getAllFilesRelative(dir: string, baseDir = dir): string[] {
    let results: string[] = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            // Recurse into directories but don't add the folder itself
            results = results.concat(getAllFilesRelative(fullPath, baseDir));
        } else {
            // Add relative file path
            results.push(path.relative(baseDir, fullPath));
        }
    }

    return results;
}
