// signaling-server/index.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let waitingUsers = [];

io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    const cleanup = () => {
        const partner = socket.partner;
        waitingUsers = waitingUsers.filter(user => user.id !== socket.id);
        if (partner) {
            partner.emit('partner-left');
            partner.partner = undefined;
        }
        socket.partner = undefined;
    };

    socket.on('find-partner', () => {
        if (socket.partner || waitingUsers.some(u => u.id === socket.id)) return;
        const partner = waitingUsers.shift();
        if (partner) {
            socket.partner = partner;
            partner.partner = socket;
            console.log(`🤝 Match found: ${socket.id} and ${partner.id}`);
            partner.emit('matched', { initiator: false });
            socket.emit('matched', { initiator: true });
        } else {
            waitingUsers.push(socket);
            socket.emit('waiting');
        }
    });

    socket.on('next-chat', () => { cleanup(); socket.emit('find-partner'); });
    socket.on('signal', (data) => { if (socket.partner) socket.partner.emit('signal', data); });
    
    // --- 👇 ADD THIS CHAT HANDLER 👇 ---
    socket.on('chat-message', (data) => {
        if (socket.partner) {
            // Forward the received message to the user's partner
            console.log(`✉️ Relaying chat message from ${socket.id} to ${socket.partner.id}`);
            socket.partner.emit('chat-message', data);
        }
    });
    // --- 👆 END OF CHAT HANDLER 👆 ---

    socket.on('disconnect', () => { console.log(`❌ Client disconnected: ${socket.id}`); cleanup(); });
});

httpServer.listen(3000, () => {
  console.log('🔥 Signaling server running on http://localhost:3000');
});