// src/lib/server/socket-server.ts
import { Server, Socket } from 'socket.io';
import type { Server as HTTPServer } from 'http';

// Use a local extended socket type instead of relying on module augmentation.
// This avoids the "Property 'partner' does not exist on type 'Socket<...>'" error.
type ExtendedSocket = Socket & { partner?: ExtendedSocket };

// --- FIX FOR DEV SERVER STATE ---
// Attach the waiting list to the global object to prevent it from being reset
// by Vite's Hot Module Replacement (HMR) during development.
const g = globalThis as any;
if (!g.waitingUsers) {
    g.waitingUsers = [];
}
const waitingUsers: ExtendedSocket[] = g.waitingUsers;
// --- END FIX ---


export function injectSocketIO(server: HTTPServer) {
    const io = new Server(server);

    io.on('connection', (socketRaw) => {
        const socket = socketRaw as ExtendedSocket;
        console.log(`✅ Client connected: ${socket.id}`);

        const removeFromWaiting = (s: ExtendedSocket) => {
            for (let i = waitingUsers.length - 1; i >= 0; i--) {
                if (waitingUsers[i].id === s.id) waitingUsers.splice(i, 1);
            }
            // keep global reference in sync for HMR
            g.waitingUsers = waitingUsers;
        };

        const cleanup = () => {
            // remove this socket from waiting list
            removeFromWaiting(socket);

            const partner = socket.partner;
            if (partner) {
                partner.emit('partner-left');
                partner.partner = undefined;
            }
            socket.partner = undefined;
        };

        const tryMatch = () => {
            // prevent re-queuing or matching if already matched
            if (socket.partner || waitingUsers.some(u => u.id === socket.id)) return;

            waitingUsers.push(socket);
            g.waitingUsers = waitingUsers;
            console.log(`⏳ User ${socket.id} added to waiting list. Waiting list size: ${waitingUsers.length}`);

            if (waitingUsers.length >= 2) {
                console.log('🎉 Found a pair! Creating match...');
                const client1 = waitingUsers.shift()!;
                const client2 = waitingUsers.shift()!;

                client1.partner = client2;
                client2.partner = client1;

                // keep global reference updated
                g.waitingUsers = waitingUsers;

                console.log(`🤝 Match created: ${client1.id} and ${client2.id}`);

                client1.emit('matched', { initiator: true });
                client2.emit('matched', { initiator: false });
            } else {
                socket.emit('waiting');
            }
        };

        socket.on('find-partner', tryMatch);

        socket.on('next-chat', () => {
            // When a user requests next chat, clean up current pairing and re-queue them
            cleanup();
            tryMatch();
        });

        socket.on('signal', (data) => {
            // Forward signaling messages to the partner (offer/answer/ice)
            if (socket.partner) {
                socket.partner.emit('signal', data);
            }
        });

        // forward chat messages to the paired partner
        socket.on('chat-message', (data: { text: string }) => {
            if (socket.partner) {
                socket.partner.emit('chat-message', { from: socket.id, text: data.text });
            }
        });

        socket.on('disconnect', () => {
            console.log(`❌ Client disconnected: ${socket.id}`);
            cleanup();
        });
    });

    console.log('🔥 Server initialized with persistent state logic.');
}