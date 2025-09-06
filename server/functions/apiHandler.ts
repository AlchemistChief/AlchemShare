// ────────── Module Importing ──────────
import type { Request, Response, NextFunction } from 'express';

// ────────── Custom Modules ──────────
import { loginCheck } from './loginCheck.ts';
import { getFileList } from './fileLoad.ts';

// ────────── API Modules ──────────

export function apiHandler(req: Request<{ endpoint: string }>, res: Response, next: NextFunction): void {
    const endpoint = req.params.endpoint;
    let authToken

    try {

        // Skip auth for login endpoint
        if (endpoint !== 'login') {
            authToken = req.headers['authorization'] || '';
            if (!authToken) {
                const err = new Error('Missing or invalid authorization token');
                err.status = 401;
                throw err;
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
    } catch (err) {
        next(err);
    }
}