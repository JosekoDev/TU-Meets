<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import VideoFeed from '$lib/VideoFeed.svelte';

  let stream: MediaStream | null = null;
  let err: string | null = null;

  onMount(async () => {
    try {
      // Must be https or http://localhost to work
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
    } catch (e) {
      const { name, message } = e as Error;
      err = `${name}: ${message}`;
      console.error('getUserMedia failed', e);
    }
  });

  onDestroy(() => {
    stream?.getTracks().forEach(t => t.stop());
  });
</script>

<div class="home-container">
  <div class="home-box">
    <a class="find-link" href="/app">Find Someone!</a>
    {#if err}<p style="color:red;margin-top:.5rem">{err}</p>{/if}
  </div>

  <!-- Pass the live stream to the component -->
  <div class="video-preview">
    <VideoFeed videoStream={stream} label="Camera Preview" />
  </div>
</div>

<style>
  .home-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
  }
  .home-box {
    background: grey;
    padding: 3rem 4rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    text-align: center;
    border-radius: 12px;
    z-index: 1;
  }
  .video-preview {
    position: absolute;
    top: 200px;
    width: 300px;
    height: 200px;
    border-radius: 8px;
    overflow: hidden;
    z-index: 2;
    box-shadow: 0 2px 12px rgba(0,0,0,0.3);
  }
  .find-link {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background-color: black;
    color: white;
    text-decoration: none;
    font-weight: 600;
    transition: background 0.2s;
  }
  .find-link:hover { background-color: green; }
</style>