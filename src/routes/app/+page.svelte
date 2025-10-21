<script lang="ts">
    import ChatBox from "../../components/ChatBox.svelte";
    import VideoPane from "../../components/VideoPane.svelte";
    import DrawBoard from "../../components/DrawBoard.svelte";

    import { onMount } from 'svelte';
    import io from 'socket.io-client';
    import type { Socket } from 'socket.io-client';

    // --- UI State ---
    let rightSplit = 50;
    let dragging = false;

    // --- Networking & Media State ---
    let yourStream: MediaStream | null = null;
    let partnerStream: MediaStream | null = null;
    let socket: Socket;
    let peerConnection: RTCPeerConnection;
    let status = 'Initializing...';
    let messages: { id: number; from: 'you' | 'them'; text: string }[] = [];

    const configuration = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    };

    // --- Networking & WebRTC Logic ---
    onMount(() => {
        initLocalVideo();
        socket = io('http://localhost:3000');

        socket.on('connect', () => (status = 'Connected'));
        socket.on('waiting', () => (status = 'Waiting for a partner...'));
        socket.on('matched', async ({ initiator }: { initiator: boolean }) => {
            status = 'Matched! Connecting...';
            messages = []; // Clear chat on new match
            await createPeerConnection(initiator);
        });
        socket.on('partner-left', () => {
            endChat();
            status = 'Partner disconnected.';
        });
        socket.on('signal', async (data) => {
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
        socket.on('chat-message', (data: { text: string }) => {
            messages = [...messages, { id: Date.now(), from: 'them', text: data.text }];
        });

        return () => socket.disconnect();
    });

    function handleSend(event: CustomEvent<string>) {
        const text = event.detail;
        messages = [...messages, { id: Date.now() + 1, from: 'you', text }];
        socket.emit('chat-message', { text });
    }

    async function initLocalVideo() {
        try {
            yourStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch (err) {
            status = "Error: Camera/Mic permissions denied.";
            console.warn('Could not get user media', err);
        }
    }

    async function createPeerConnection(isInitiator: boolean) {
        endChat(false);
        peerConnection = new RTCPeerConnection(configuration);
        yourStream?.getTracks().forEach((track) => peerConnection.addTrack(track, yourStream!));
        peerConnection.ontrack = (event) => (partnerStream = event.streams[0]);
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) socket.emit('signal', { candidate: event.candidate });
        };
        if (isInitiator) {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.emit('signal', { offer });
        }
    }

    function endChat(notifyServer = true) {
        if (notifyServer) status = 'Partner disconnected.';
        if (peerConnection) peerConnection.close();
        partnerStream = null;
        messages = [];
    }

    const findPartner = () => socket.emit('find-partner');
    const nextChat = () => socket.emit('next-chat');

    // --- UI Dragging Logic ---
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
                <button on:click={findPartner} disabled={status !== 'Connected' && status !== 'Partner disconnected.'}>Find Partner</button>
                <button on:click={nextChat} disabled={!status.startsWith('Matched')}>Next Chat</button>
            </div>
        </div>
        <div class="video-top video-block">
            <VideoPane videoStream={partnerStream} label="Partner" />
        </div>
        <div class="video-bottom video-block">
            <VideoPane videoStream={yourStream} label="You" />
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
            aria-orientation="horizontal"
            aria-label="Resize draw and chat panes"
            on:pointerdown={startDrag}
            on:dblclick={() => { if (!dragging) rightSplit = 50 }}
        >
            <div class="handle"></div>
        </div>
        <div class="chat-area pane-half">
            <ChatBox {messages} on:send={handleSend} />
        </div>
    </section>
</main>

<style>
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

    .layout-root {
        display: flex;
        height: 100vh;
        width: 100%;
        font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
    }

    .left-pane {
        flex: 0 0 50%;
        display: flex;
        flex-direction: column;
        border-right: 1px solid rgba(0,0,0,0.08);
        min-width: 0;
    }

    .right-pane {
        flex: 1 1 50%;
        display: flex;
        flex-direction: column;
        min-width: 0;
    }

    .video-block {
        flex: 1 1 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem;
        box-sizing: border-box;
    }

    .video-block > :global(div),
    .video-block > :global(video) {
        width: 100%;
        height: 100%;
        max-width: 720px;
        max-height: 48vh;
        border-radius: 8px;
        overflow: hidden;
        background: #000;
    }

    .pane-half {
        min-height: 0;
        box-sizing: border-box;
        overflow: hidden;
        display: flex; /* Helps child components fill height */
        flex-direction: column; /* Helps child components fill height */
    }

    .divider {
        height: 8px;
        width: 100%;
        background: linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.12), rgba(255,255,255,0.02));
        box-shadow: inset 0 2px 6px rgba(0,0,0,0.6);
        cursor: row-resize;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .divider .handle {
        width: 48px;
        height: 4px;
        border-radius: 999px;
        background: rgba(255,255,255,0.12);
        box-shadow: 0 1px 0 rgba(0,0,0,0.4);
    }
    
    .chat-area { flex-grow: 1; }
    .draw-area { flex-grow: 1; }

    /* ▼▼▼ CORRECTED LINES ▼▼▼ */
    .right-pane[data-split] > .draw-area { flex-basis: calc(var(--draw-h) - 4px); }
    .right-pane[data-split] > .chat-area { flex-basis: calc(var(--chat-h) - 4px); }
    /* ▲▲▲ CORRECTED LINES ▲▲▲ */

    @media (max-width: 900px) {
        .layout-root { flex-direction: column; }
        .left-pane, .right-pane { flex: none; width: 100%; height: auto; }
        .video-block > :global(div), .video-block > :global(video) { max-height: 36vh; }
    }
</style>