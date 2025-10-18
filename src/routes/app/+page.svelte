<script lang="ts">
    import ChatBox from "../../components/ChatBox.svelte";
    import VideoPane from "../../components/VideoPane.svelte";
    import DrawBoard from "../../components/DrawBoard.svelte";

    import { onMount } from 'svelte';
    import io from 'socket.io-client';
    import type { Socket } from 'socket.io-client';

    // --- UI State (from your code) ---
    let rightSplit = 50; // percent height for draw-area (rest goes to chat)
    let dragging = false;

    // --- Networking & Media State (New) ---
    let yourStream: MediaStream | null = null;
    let partnerStream: MediaStream | null = null;
    let socket: Socket;
    let peerConnection: RTCPeerConnection;
    let status = 'Initializing...';

    // new: chat messages shown in UI
    let messages: { from: string; text: string }[] = [];

    const configuration = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    };

    // --- Networking & WebRTC Logic (New) ---

    onMount(() => {
        // Initialize local video as soon as the component mounts
        initLocalVideo();

        // Connect to the Socket.IO server
        socket = io();

        socket.on('connect', () => {
            status = 'Connected';
        });
        socket.on('waiting', () => (status = 'Waiting for a partner...'));
        socket.on('matched', async ({ initiator }: { initiator: boolean }) => {
            status = 'Matched! Connecting...';
            await createPeerConnection(initiator);
        });
        socket.on('partner-left', endChat);
        socket.on('signal', async (data: { offer?: RTCSessionDescriptionInit; answer?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit }) => {
            if (!peerConnection) return;
            if (data.offer) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                socket.emit('signal', { answer });
            } else if (data.answer) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
            } else if (data.candidate) {
                await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        });

        // receive chat messages from server (forwarded from partner)
        socket.on('chat-message', (msg: { from: string; text: string }) => {
            // mark incoming message as from partner
            messages = [...messages, { from: 'partner', text: msg.text }];
        });

        return () => socket.disconnect();
    });

    async function initLocalVideo() {
        try {
            // Requesting audio as well, which is typical for video chat
            yourStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch (err) {
            status = "Error: Camera/Mic permissions denied.";
            console.warn('Could not get user media', err);
        }
    }

    async function createPeerConnection(isInitiator: boolean) {
        endChat(false); // Clean up any previous connection
        peerConnection = new RTCPeerConnection(configuration);

        // Add your local video stream tracks to the connection
        yourStream?.getTracks().forEach((track) => peerConnection.addTrack(track, yourStream!));

        // When the partner's video stream arrives, display it
        peerConnection.ontrack = (event) => {
            console.log('✅ PARTNER STREAM RECEIVED!', event.streams[0]);
            partnerStream = event.streams[0];
        };

        // Send network candidates to the other peer via the server
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('signal', { candidate: event.candidate });
            }
        };

        // If you are the one initiating the call, create and send the offer
        if (isInitiator) {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.emit('signal', { offer });
        }
    }

    function endChat(notifyServer = true) {
        if (notifyServer) status = 'Partner disconnected.';
        if (peerConnection) {
            peerConnection.close();
        }
        partnerStream = null; // Clear the partner's video stream
    }

    const findPartner = () => socket.emit('find-partner');
    const nextChat = () => {
        endChat();
        socket.emit('next-chat');
    };

    // send a chat message to your partner via server
    function sendChat(text: string) {
        if (!text.trim()) return;
        // show locally
        messages = [...messages, { from: 'you', text }];
        // forward to server
        socket.emit('chat-message', { text });
    }

    // --- UI Dragging Logic (from your code) ---
    function startDrag(e: PointerEvent) {
        dragging = true;
        e.preventDefault();
    }

    function stopDrag() {
        dragging = false;
    }

    function onPointerMove(e: PointerEvent) {
        if (!dragging) return;
        const rightPane = e.currentTarget as HTMLElement;
        const rect = rightPane.getBoundingClientRect();
        const y = e.clientY - rect.top;
        let pct = (y / rect.height) * 100;
        rightSplit = Math.max(10, Math.min(90, pct));
    }
</script>

<main class="layout-root">
    <section class="left-pane">
        <div class="controls-area">
            <p>Status: {status}</p>
            <div class="buttons">
                <button on:click={findPartner} disabled={status !== 'Connected'}>Find Partner</button>
                <button on:click={nextChat} disabled={!status.startsWith('Matched')}>Next Chat</button>
            </div>
        </div>
        <div class="video-top video-block">
            <VideoPane videoStream={partnerStream as unknown as null | undefined} label="Partner" />
        </div>
        <div class="video-bottom video-block">
            <VideoPane videoStream={yourStream as unknown as null | undefined} label="You" />
        </div>
    </section>

    <section
        class="right-pane"
        on:pointermove={onPointerMove}
        on:pointerup={stopDrag}
        on:pointercancel={stopDrag}
        on:pointerleave={stopDrag}
        data-split
        style="--draw-h: {rightSplit}%; --chat-h: {100 - rightSplit}%"
    >
        <div class="draw-area pane-half">
            <DrawBoard />
        </div>
        <div
            class="divider"
            role="separator"
            on:pointerdown={startDrag}
            on:dblclick={() => { if (!dragging) rightSplit = 50 }}
        >
            <div class="handle"></div>
        </div>
        <div class="chat-area pane-half">
            <!-- pass messages and handle send events from ChatBox -->
            <ChatBox {messages} on:send={(e) => sendChat(e.detail)} />
        </div>
    </section>
</main>

<style>
    /* New styles for the added controls */
    .controls-area {
        padding: 0.5rem 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(0,0,0,0.2);
        border-bottom: 1px solid rgba(0,0,0,0.4);
        flex-shrink: 0;
    }
    .controls-area p { margin: 0; font-size: 0.9rem; }
    .controls-area .buttons { display: flex; gap: 0.5rem; }
    button { padding: 0.5rem 1rem; border-radius: 4px; border: none; cursor: pointer; }
    button:disabled { background-color: #555; color: #999; cursor: not-allowed; }

    /* Your existing styles are below */
    .layout-root {
        display: flex;
        height: 100vh;
        /* ...etc... */
    }

    /* Ensure left column is a column layout with fixed controls and two video boxes that do not resize */
    .left-pane {
        display: flex;
        flex-direction: column;
        width: 40%; /* adjust as needed */
        min-width: 280px;
        max-width: 600px;
        background: #111;
    }

    /* Controls stay fixed, video blocks share remaining space equally and do not cause their contents to overflow */
    .video-block {
        flex: 1 1 0;
        min-height: 0; /* allow flex children to shrink properly inside column */
        overflow: hidden;
        position: relative;
        background: #000;
        border-top: 1px solid rgba(255,255,255,0.04);
    }

    /* Make sure any video element inside fills the box and preserves aspect ratio */
    /* Using :global to target <video> rendered inside the VideoPane component */
    .video-block :global(video),
    .video-block :global(video[playsinline]) {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: contain; /* 'contain' fits the whole video inside the box without cropping; use 'cover' to fill/crop */
        background: #000;
    }

    /* Prevent accidental browser resizing UI (if any) and ensure layout doesn't let video boxes be resized by content */
    .video-block,
    .video-block * {
        resize: none;
        box-sizing: border-box;
        user-select: none;
    }

    /* small responsive tweak so right pane gets remaining space */
    .right-pane {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
    }
</style>