// ────────── Module Importing ──────────
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// ────────── Custom Modules ──────────
import { generateUniqueToken } from './utils.ts';
import { initializeNewLogin } from './webSocketHandler.ts';

// ────────── Login Check Module ──────────
// Extend UserCredentials with userID and permissions
interface UserCredentials {
    username: string;
    password: string;
    userID: number;
    permissions: string[];
}

interface CredentialsFile {
    users: UserCredentials[];
}

export function loginCheck(req: Request, res: Response) {
    const { username, password } = req.body.message;

    if (!username || !password) {
        throw new HttpError(400, 'Missing username or password');
    }

    let credentials: CredentialsFile;
    try {
        const rawData = fs.readFileSync(path.join(import.meta.dirname, '../assets/credentials.json'), 'utf-8');
        credentials = JSON.parse(rawData);
    } catch (err) {
        console.error('Failed to read credentials.json:', err);
        throw new HttpError(500, `${err}`);
    }

    const user = credentials.users.find((u) => u.username === username);
    if (!user || user.password !== password) {
        console.log(`Invalid login attempt for user: ${username}`);
        throw new HttpError(401, 'Invalid credentials');
    }

    // Generate auth token on success
    const authToken = generateUniqueToken();

    initializeNewLogin(authToken, username, user.userID, req.ip);

    // Send success + token + extra user data to client
    res.status(200).json({
        success: true,
        authToken: authToken,
        userID: user.userID,
        permissions: user.permissions
    });
}
