// ────────── Module Importing ──────────
import type { Request, Response, NextFunction } from 'express';

// ────────── Custom Modules ──────────
import { loginCheck } from './loginCheck.ts';
import { getFileList } from './fileLoad.ts';

// ────────── API Modules ──────────
const allowedMethods: Record<string, string[]> = {
    login: ['POST'],
    listfiles: ['POST'],
};

export function apiHandler(req: Request<{ endpoint: string }>, res: Response, next: NextFunction): void {
    const endpoint = req.params.endpoint;
    const method = req.method.toUpperCase();
    let authToken

    try {

        // ────────── Validate HTTP Method ──────────
        // Check if endpoint exists first
        if (!allowedMethods[endpoint]) {
            throw new HttpError(404, `API endpoint '${endpoint}' not found.`);
        }

        // Check if method is allowed
        if (!allowedMethods[endpoint]?.includes(method)) {
            throw new HttpError(405, `Method ${method} not allowed for endpoint '${endpoint}'.`);
        }

        // Check if authorized, except on login
        if (endpoint !== 'login') {
            authToken = req.headers['authorization'] || '';
            if (!authToken) {
                throw new HttpError(401, 'Missing or invalid authorization token');
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
                throw new HttpError(404, `API endpoint '${endpoint}' not found.`);
        }
    } catch (err) {
        next(err);
    }
}