// ────────── Module Importing ──────────
import dotenv from 'dotenv'; dotenv.config({ path: __dirname + '/.env' });
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
    CREDENTIALS_PATH: path.join(__dirname, 'assets/credentials.json'),
};

// ────────── HTTPS Server Setup ──────────
const server = https.createServer({
    key: fs.readFileSync(path.join(__dirname, 'assets/selfsigned.key')),
    cert: fs.readFileSync(path.join(__dirname, 'assets/selfsigned.crt')),
}, app);

// ────────── Middleware Configuration ──────────
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ────────── Routes ──────────
app.get('/selfsigned.crt', (req, res) => {
    res.sendFile(path.join(__dirname, 'assets/selfsigned.crt'));
});

app.post('/api/login', loginCheck);

// ────────── Server Startup ──────────
server.listen(settings.PORT, () => {
    new dnssd.Advertisement(dnssd.tcp('https'), settings.PORT, {
        name: `${settings.DOMAIN}`,
        host: `${settings.DOMAIN}`,
    }).start();

    console.log(`HTTPS Server running on port ${settings.PORT}`);
    console.log(`Server: https://${settings.DOMAIN}:${settings.PORT}`);
});

// ────────── WebSocket Handler ──────────
initializeWebSocketServer(server);
