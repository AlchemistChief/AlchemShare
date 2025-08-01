// ────────── Module Importing ──────────
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// ────────── Custom Modules ──────────

// ────────── Login Check Module ──────────

interface UserCredentials {
    username: string;
    password: string;
}

interface CredentialsFile {
    users: UserCredentials[];
}

// Use import.meta.dirname for resolving credentials path
const CREDENTIALS_PATH = path.join(import.meta.dirname, '../assets/credentials.json');

/**
 * Express handler for login API
 */
export function loginCheck(req: Request, res: Response) {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ error: 'Missing username or password' });
        return;
    }

    let credentials: CredentialsFile;
    try {
        const rawData = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
        credentials = JSON.parse(rawData);
    } catch (err) {
        console.error('Failed to read credentials.json:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }

    const user = credentials.users.find((u) => u.username === username);
    if (!user || user.password !== password) {
        console.log(`Invalid login attempt for user: ${username}`);
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }

    // Generate auth token on success
    const authToken = generateAuthToken();

    // TODO: Optionally, store authToken with user session or DB here

    // Send success + token to client
    res.status(200).json({ success: true, authToken });
}

export function generateAuthToken(): string {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    const timestampPart = Date.now().toString(36);

    let token = timestampPart;

    while (token.length < 20) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return token;
}
