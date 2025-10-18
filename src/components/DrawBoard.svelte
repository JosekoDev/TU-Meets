<script>
  // Simple placeholder draw board. We'll keep it minimal and style via CSS.
  let drawing = false;
  let lines = [];

  function pointerDown(e) {
    drawing = true;
    const rect = e.target.getBoundingClientRect();
    lines.push([{ x: e.clientX - rect.left, y: e.clientY - rect.top }]);
  }

  function pointerMove(e) {
    if (!drawing) return;
    const rect = e.target.getBoundingClientRect();
    const cur = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    lines[lines.length - 1].push(cur);
  }

  function pointerUp() {
    drawing = false;
  }

  function clearBoard() {
    lines = [];
  }
</script>

<div class="draw-wrap">
  <svg
    class="draw-canvas"
    on:pointerdown={pointerDown}
    on:pointermove={pointerMove}
    on:pointerup={pointerUp}
    on:pointerleave={pointerUp}
  >
    {#each lines as line}
      <polyline points={line.map(p => `${p.x},${p.y}`).join(' ')} stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    {/each}
  </svg>
  <div class="draw-actions">
    <button on:click={clearBoard}>Clear</button>
  </div>
</div>

<style>
.draw-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #1f1f1f 0%, #121212 100%);
  display: flex;
  align-items: stretch;
}
.draw-canvas {
  width: 100%;
  height: 100%;
  touch-action: none;
}
.draw-actions {
  position: absolute;
  top: 8px;
  right: 8px;
}
.draw-actions button {
  background: rgba(255,255,255,0.06);
  color: white;
  border: 1px solid rgba(255,255,255,0.08);
  padding: 6px 10px;
  border-radius: 6px;
}
</style>
