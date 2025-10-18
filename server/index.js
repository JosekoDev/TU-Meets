// server/index.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let waitingUsers = [];


wss.on('connection', (ws) => {
    ws.id = uuidv4();
    console.log(`Client connected: ${ws.id}`);

    const tryMatch = () => {
        if (waitingUsers.length >= 1) {
            const partner = waitingUsers.shift();
            if (partner === ws) { // Avoid matching with self
                waitingUsers.unshift(partner);
                return;
            }
            
            ws.partner = partner;
            partner.partner = ws;

            console.log(`Matching ${ws.id} with ${partner.id}`);
            partner.send(JSON.stringify({ type: 'matched', initiator: false }));
            ws.send(JSON.stringify({ type: 'matched', initiator: true }));
        } else {
            waitingUsers.push(ws);
            ws.send(JSON.stringify({ type: 'waiting' }));
        }
    };

    const cleanup = () => {
        waitingUsers = waitingUsers.filter(user => user !== ws);
        if (ws.partner) {
            if (ws.partner.readyState === ws.partner.OPEN) {
                ws.partner.send(JSON.stringify({ type: 'partner-left' }));
            }
            ws.partner.partner = null;
        }
        ws.partner = null;
    };

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        switch (data.type) {
            case 'find-partner':
                tryMatch();
                break;
            case 'next-chat':
                cleanup();
                tryMatch();
                break;
            case 'offer':
            case 'answer':
            case 'candidate':
                if (ws.partner) {
                    ws.partner.send(JSON.stringify(data));
                }
                break;
        }
    });

    ws.on('close', () => {
        console.log(`Client disconnected: ${ws.id}`);
        cleanup();
    });
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// A simple root route for testing the server directly
app.get('/', (req, res) => {
    res.send('Node.js server is running!'); 
});

// --- Production-only routes ---
if (process.env.NODE_ENV === 'production') {
    const buildPath = path.resolve(__dirname, '../dist');
    
    // Serve static files from the Svelte build folder
    app.use(express.static(buildPath));

    // For all other non-API requests, send the Svelte app
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(buildPath, 'index.html')); 
    });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});