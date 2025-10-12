// ────────── Module Importing ──────────
import dotenv from 'dotenv'; dotenv.config({ path: import.meta.dirname + '/.env' });
import express, { Request, Response, NextFunction } from 'express';
import https from 'https';
import dnssd from 'dnssd';
import path from 'path';
import fs from 'fs';

// ────────── Custom Modules ──────────
import './assets/errorClass'; // Extend error Class
import { apiHandler } from './functions/apiHandler.ts';
import { initializeWebSocketServer } from './functions/webSocketHandler.ts';

// ────────── Application Setup ──────────
const app = express();

const settings = {
    PORT: Number(process.env.PORT) || 3000,
    DOMAIN: process.env.DOMAIN || 'localhost',
    CREDENTIALS_PATH: path.join(import.meta.dirname, 'assets/credentials.json'),
};

// ────────── HTTPS Server Setup ──────────
const server = https.createServer({
    key: fs.readFileSync(path.join(import.meta.dirname, 'assets/selfsigned-local.key')),
    cert: fs.readFileSync(path.join(import.meta.dirname, 'assets/selfsigned-local.crt')),
}, app);

// ────────── Middleware Configuration ──────────
app.use(express.json());
app.use(express.static(path.join(import.meta.dirname, '../public')));

// ────────── Routes ──────────
app.all('/api/:endpoint', apiHandler);

// ────────── Error-handling middleware ──────────
//404 handler for unmatched routes
app.use((req, res) => {
    res.status(404).sendFile(path.join(import.meta.dirname, '../public/404.html'));
});

// General error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || 500;

    // Send JSON response with status
    res.status(status).json({
        errorMessage: err.message,
        status: status,
    });
});

// ────────── Server Startup ──────────
server.listen(settings.PORT, '0.0.0.0', () => {
    new dnssd.Advertisement(dnssd.tcp('https'), settings.PORT, {
        name: `${settings.DOMAIN}`,
        host: `${settings.DOMAIN}`,
        type: "_https._tcp",
    }).start();

    console.log(`HTTPS Server running on port ${settings.PORT}`);
    console.log(`Server: https://${settings.DOMAIN}:${settings.PORT}`);
});

// ────────── WebSocket Server Setup ──────────
initializeWebSocketServer(server);