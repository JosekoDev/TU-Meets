<script>
  import ChatBox from "../../components/ChatBox.svelte";
  import VideoPane from "../../components/VideoPane.svelte";
  import DrawBoard from "../../components/DrawBoard.svelte";

  import { onMount } from 'svelte';

  let partnerVideoSrc = "";
  let yourVideoSrc = "";
  let yourStream = null;
  let rightSplit = 50; // percent height for draw-area (rest goes to chat)
  let dragging = false;

  function startDrag(e) {
    dragging = true;
    e.preventDefault();
  }

  function stopDrag() {
    dragging = false;
  }

  function onPointerMove(e) {
    if (!dragging) return;
    // compute new split based on pointer Y relative to right-pane
    const rightPane = document.querySelector('.right-pane');
    if (!rightPane) return;
    const rect = rightPane.getBoundingClientRect();
    const y = e.clientY - rect.top; // distance from top of right-pane
    let pct = (y / rect.height) * 100;
    pct = Math.max(10, Math.min(90, pct)); // clamp between 10% and 90%
    rightSplit = pct;
  }

  onMount(async () => {
    try {
      yourStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    } catch (err) {
      console.warn('Could not get user media', err);
    }
  });
</script>

<main class="layout-root">
  <section class="left-pane">
    <div class="video-top video-block">
      <VideoPane videoSrc={partnerVideoSrc} label="Partner" />
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
      <DrawBoard onReset={() => { rightSplit = 50 }} />
    </div>
    <div
      class="divider"
      role="separator"
      aria-orientation="horizontal"
      aria-label="Resize draw and chat panes"
      on:pointerdown={startDrag}
    >
      <div class="handle"></div>
    </div>
    <div class="chat-area pane-half">
      <ChatBox />
    </div>
  </section>
</main>


<style>

/* quick tune: change --split to move the vertical separator (I'm tweaking this manually) */
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

.draw-area {
  flex: none;
}

.pane-half {
  min-height: 0;
  box-sizing: border-box;
  overflow: hidden;
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
}

.divider .handle {
  width: 48px;
  height: 4px;
  border-radius: 999px;
  background: rgba(255,255,255,0.12);
  box-shadow: 0 1px 0 rgba(0,0,0,0.4);
}

.chat-area {
  border-top: 1px solid rgba(255,255,255,0.03);
  background: linear-gradient(180deg, rgba(0,0,0,0.02), transparent);
}

.draw-area {
  border-bottom: 1px solid rgba(255,255,255,0.02);
}

/* dynamic sizing using inline styles from component state */
.right-pane[data-split] > .draw-area { height: var(--draw-h); }
.right-pane[data-split] > .chat-area { height: var(--chat-h); }

@media (max-width: 900px) {
  .layout-root { flex-direction: column; }
  .left-pane, .right-pane { flex: none; width: 100%; height: auto; }
  .video-block > :global(div), .video-block > :global(video) { max-height: 36vh; }
}
</style>