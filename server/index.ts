// ────────── Module Importing ──────────
import dotenv from 'dotenv'; dotenv.config({ path: import.meta.dirname + '/.env' });
import express from 'express';
import https from 'https';
import dnssd from 'dnssd';
import path from 'path';
import fs from 'fs';

// ────────── Custom Modules ──────────
import { initializeWebSocketServer } from './functions/webSocketHandler.ts';
import { loginCheck } from './functions/loginCheck.ts';

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
app.get('/selfsigned.crt', (req, res) => {
    res.sendFile(path.join(import.meta.dirname, 'assets/selfsigned.crt'));
});

app.post('/api/login', loginCheck);

// ────────── Server Startup ──────────
server.listen(settings.PORT, '0.0.0.0', () => {
    new dnssd.Advertisement(dnssd.tcp('https'), settings.PORT, {
        name: `${settings.DOMAIN}`,
        host: `${settings.DOMAIN}`,
        type: "_http._tcp",
    }).start();

    console.log(`HTTPS Server running on port ${settings.PORT}`);
    console.log(`Server: https://${settings.DOMAIN}:${settings.PORT}`);
});

// ────────── WebSocket Handler ──────────
initializeWebSocketServer(server);