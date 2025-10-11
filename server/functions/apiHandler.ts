// ────────── Module Importing ──────────
import type { Request, Response, NextFunction } from 'express';

// ────────── Custom Modules ──────────
import { loginCheck } from './loginCheck.ts';
import { getFileList } from './fileLoad.ts';

// ────────── API Modules ──────────

export function apiHandler(req: Request<{ endpoint: string }>, res: Response, next: NextFunction): void {
    const endpoint = req.params.endpoint;
    const method = req.method.toUpperCase();
    let authToken

    try {

        // ────────── Validate HTTP Method ──────────
        const allowedMethods: Record<string, string[]> = {
            login: ['POST'],
            listfiles: ['POST']
        };

        // Check if endpoint exists first
        if (!allowedMethods[endpoint]) {
            throw Object.assign(
                new Error(`API endpoint '${endpoint}' not found.`),
                { status: 404 }
            );
        }

        // Check if method is allowed
        if (!allowedMethods[endpoint]?.includes(method)) {
            throw Object.assign(
                new Error(`Method ${method} not allowed for endpoint '${endpoint}'.`),
                { status: 405 }
            );
        }

        // Check if authorized, except on login
        if (endpoint !== 'login') {
            authToken = req.headers['authorization'] || '';
            if (!authToken) {
                throw Object.assign(
                    new Error('Missing or invalid authorization token'),
                    { status: 401 }
                );
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
                throw Object.assign(
                    new Error(`API endpoint '${endpoint}' not found.`),
                    { status: 404 }
                );
                return;
        }
    } catch (err) {
        next(err);
    }
}