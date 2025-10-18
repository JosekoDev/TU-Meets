<script lang="ts">
  import VideoFeed from '$lib/VideoFeed.svelte';
  let videoSrc = '/videos/demo.mp4';
</script>

<div class="home-container">
  <div class="home-box">
    <a class="find-link" href="/app">Find Someone!</a>
  </div>

  <div class="video-preview">
    <VideoFeed videoSrc={videoSrc} label="Camera Preview" />
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
    background: white;
    padding: 3rem 4rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    text-align: center;
    border-radius: 12px;
    z-index: 1;
  }

  /* Position video on top of the box */
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
    background-color: red;
    color: white;
    text-decoration: none;
    font-weight: 600;
    transition: background 0.2s;
  }

  .find-link:hover {
    background-color: green;
  }
</style>