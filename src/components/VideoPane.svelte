<script>
  export let videoSrc = ""; // fallback URL
  export let videoStream = null; // MediaStream (I pipe the camera here)
  export let label = "";

  let videoEl;

  // Attach MediaStream to the video element when it shows up.
  // Leaving in a try/catch because browsers are weird sometimes.
  $: if (videoEl && videoStream) {
    try {
      videoEl.srcObject = videoStream;
    } catch (err) {
      // fallback: at least log it for now
      console.warn('Could not set srcObject on video element', err);
    }
  }
</script>

<div style="position: relative; width: 100%; height: 100%; background: #000; display: flex; align-items: center; justify-content: center; color: white; overflow: hidden;">
  {#if videoStream}
    <video bind:this={videoEl} autoplay playsinline muted style="width: 100%; height: 100%; object-fit: cover;"></video>
  {:else if videoSrc}
    <video bind:this={videoEl} src={videoSrc} autoplay muted playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
  {:else}
    <span>{label} Video</span>
  {/if}
  <div style="position: absolute; bottom: 0; left: 0; background: rgba(0,0,0,0.5); padding: 0.25rem 0.5rem; font-size: 0.9rem;">
    {label}
  </div>
</div>