// ────────── Module Importing ──────────
import type { Request, Response, RequestHandler } from 'express';

// ────────── Custom Modules ──────────
import { loginCheck } from './loginCheck.ts';
import { getFileList } from './fileLoad.ts';

// ────────── API Modules ──────────

export function apiHandler(req: Request<{ endpoint: string }>, res: Response): void {
    const endpoint = req.params.endpoint;
    let authToken

    // Skip auth for login endpoint
    if (endpoint !== 'login') {
        authToken = req.headers['authorization'] || '';
        if (!authToken) {
            res.status(401).json({ error: 'Missing or invalid authorization token' });
            return;
        }
    }

    // ────────── Endpoint Routing ──────────
    switch (endpoint) {
        case 'login':
            loginCheck(req, res);
            break;
        case 'listfiles':
            getFileList(req, res, authToken);
            break;
        default:
            res.status(404).json({ error: `API endpoint '${endpoint}' not found.` });
            return;
    }
}
