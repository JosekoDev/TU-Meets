<script lang="ts">
    import { onMount } from 'svelte';
    import VideoFeed from '$lib/VideoFeed.svelte';

    // This will hold the live stream from the user's camera
    let yourStream: MediaStream | null = null;
    let cameraError = false;

    // When the component loads, ask for camera permission
    onMount(async () => {
        try {
            yourStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } catch (err) {
            console.warn('Could not get user media for preview:', err);
            cameraError = true;
        }

        // Cleanup when the user navigates away
        return () => {
            yourStream?.getTracks().forEach(track => track.stop());
        }
    });
</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="home-container">
    <div class="card">
        <div class="logo">
            <svg width="42" height="42" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                <path d="M7 8H41V15H31V41H17V15H7V8Z"/>
            </svg>
            <h1 class="title">TU-Meets</h1>
        </div>
        <p class="subtitle">Connect with fellow Owls, face-to-face.</p>

        <div class="video-preview">
            <VideoFeed videoStream={yourStream} label="Camera Preview" />
            {#if cameraError}
                <div class="error-overlay">
                    <p>Camera access denied.</p>
                    <span>Please enable camera permissions to use TU-Meets.</span>
                </div>
            {/if}
        </div>

        <a class="find-link" href="/app">Find a Partner</a>
    </div>
</div>

<style>
    :global(body) {
        font-family: 'Poppins', sans-serif;
    }

    .home-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #111, #333);
        padding: 2rem;
    }

    .card {
        background: #242424;
        padding: 2.5rem 3rem;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        text-align: center;
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        max-width: 500px;
        width: 100%;
    }
    
    .logo {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        color: #9D2235; /* Temple Cherry Red */
    }

    .title {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0;
        color: #fff;
    }

    .subtitle {
        font-size: 1.1rem;
        margin: 0.5rem 0 2rem 0;
        color: rgba(255, 255, 255, 0.7);
    }

    .video-preview {
        width: 100%;
        aspect-ratio: 16 / 9;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 2rem;
        background: #000;
        position: relative;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .error-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1rem;
    }
    .error-overlay p {
        font-weight: 600;
        margin: 0 0 0.25rem 0;
    }
    .error-overlay span {
        font-size: 0.9rem;
        opacity: 0.8;
    }

    /* --- Button Centering Fix --- */
    .find-link {
        display: inline-block;
        /* width: 100%; <-- This was removed to allow centering */
        padding: 0.85rem 2.5rem; /* Increased padding for a better look */
        background-color: #9D2235; /* Temple Cherry Red */
        color: white;
        text-decoration: none;
        font-weight: 600;
        font-size: 1rem;
        border-radius: 8px;
        transition: transform 0.2s ease, background-color 0.2s ease;
    }
    /* --- End of Fix --- */

    .find-link:hover {
        background-color: #831c2c; /* A slightly darker red for hover */
        transform: translateY(-2px);
    }
</style>