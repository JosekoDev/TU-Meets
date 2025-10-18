<script>
  // Drawing state
  import { onDestroy } from 'svelte';

  let drawing = false;
  // lines is an array of { points: [{x,y}], color, width, tool }
  let lines = [];
  export let onReset = undefined;
  let penOn = true;
  let tool = 'pen'; // 'pen' | 'eraser'
  let color = '#ffffff';
  let strokeWidth = 2;
  let activePointerId = null;
  // tabs: 'draw' | 'checklist' | 'timer' | 'stickies'
  let activeTab = 'draw';

  import Checklist from './Checklist.svelte';
  import Timer from './Timer.svelte';
  import Stickies from './Stickies.svelte';

  // local state passed to child components
  let checklist = [
    { id: 1, text: 'Read notes', done: false },
    { id: 2, text: 'Review problem', done: false },
    { id: 3, text: 'Summarize', done: false },
  ];
  let timer = 0;
  let stickies = [];

  // sticky drag helpers
  let draggingSticky = null;
  let dragOffset = { x: 0, y: 0 };

  function onStickyPointerMove(e) {
    if (!draggingSticky) return;
    const wrap = document.querySelector('.draw-wrap');
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    stickies = stickies.map(s => s.id === draggingSticky.id ? { ...s, x, y } : s);
  }

  function onStickyPointerUp(e) {
    if (!draggingSticky) return;
    try { const wrap = document.querySelector('.draw-wrap'); if (wrap) wrap.releasePointerCapture(e.pointerId); } catch (err) {}
    draggingSticky = null;
  }

  function pointerDown(e) {
    if (!penOn) return;
    const svg = e.currentTarget; // the svg element the listener is attached to
    if (!svg) return;
    drawing = true;
    activePointerId = e.pointerId;
    try { svg.setPointerCapture(activePointerId); } catch (err) {}
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const line = {
      points: [{ x, y }],
      color: tool === 'eraser' ? '#121212' : color,
      width: strokeWidth,
      tool,
    };
    lines = [...lines, line];
  }

  function pointerMove(e) {
    if (!drawing) return;
    const svg = e.currentTarget;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const last = lines[lines.length - 1];
    if (!last) return;
    last.points = [...last.points, { x, y }];
    // reassign to trigger Svelte reactivity
    lines = [...lines.slice(0, -1), last];
  }

  function pointerUp(e) {
    const svg = e.currentTarget;
    if (svg && activePointerId != null) {
      try { svg.releasePointerCapture(activePointerId); } catch (err) {}
    }
    activePointerId = null;
    drawing = false;
  }

  function clearBoard() {
    lines = [];
  }
</script>

<div class="draw-wrap" on:pointermove={onStickyPointerMove} on:pointerup={onStickyPointerUp} on:pointercancel={onStickyPointerUp}>
  <div class="info-panel">
    <div class="tabs">
      <button class:active={activeTab==='draw'} on:click={() => (activeTab='draw')} title="Draw">🖊️</button>
      <button class:active={activeTab==='checklist'} on:click={() => (activeTab='checklist')} title="Checklist">✅</button>
      <button class:active={activeTab==='timer'} on:click={() => (activeTab='timer')} title="Timer">⏱️</button>
      <button class:active={activeTab==='stickies'} on:click={() => (activeTab='stickies')} title="Stickies">📌</button>
    </div>
    <!-- tabs only; content rendered full-size below -->
  </div>

  <div class="pen-toggle bottom">
    <button class:active={penOn} on:click={() => (penOn = !penOn)} aria-pressed={penOn} title="Toggle pen">
      {#if penOn}Pen On{:else}Pen Off{/if}
    </button>
    <button class:active={tool === 'pen'} on:click={() => (tool = 'pen')} title="Pen tool">✎</button>
    <button class:active={tool === 'eraser'} on:click={() => (tool = 'eraser')} title="Eraser">🩹</button>
    <input type="color" bind:value={color} title="Pick color" />
    <label style="margin-left:6px;color:rgba(255,255,255,0.7)">W</label>
    <input type="range" min="1" max="20" bind:value={strokeWidth} style="width:90px" />
  </div>
  {#if activeTab === 'draw'}
    <svg
      class="draw-canvas"
      on:pointerdown={pointerDown}
      on:pointermove={pointerMove}
      on:pointerup={pointerUp}
      on:pointerleave={pointerUp}
    >
      {#each lines as line}
        <polyline points={line.points.map(p => `${p.x},${p.y}`).join(' ')} stroke={line.color} stroke-width={line.width} fill="none" stroke-linecap="round" stroke-linejoin="round" />
      {/each}
    </svg>
  {:else if activeTab === 'checklist'}
    <div class="panel-full">
      <Checklist {checklist} on:update={(e) => checklist = e.detail.items} />
    </div>
  {:else if activeTab === 'timer'}
    <div class="panel-full">
      <Timer bind:seconds={timer} />
    </div>
  {:else if activeTab === 'stickies'}
    <div class="panel-full">
      <Stickies {stickies} on:update={(e) => stickies = e.detail.items} on:dragstart={(e) => {
        // parent will handle pointer capture and movement
        const { id, event } = e.detail;
        const it = stickies.find(s => s.id === id);
        if (!it) return;
        draggingSticky = it;
        const rect = event.currentTarget.getBoundingClientRect();
        dragOffset.x = event.clientX - rect.left - it.x;
        dragOffset.y = event.clientY - rect.top - it.y;
        try { event.currentTarget.setPointerCapture(event.pointerId); } catch (err) {}
      }} />
    </div>
  {/if}
  <div class="draw-actions">
    <button on:click={clearBoard}>Clear</button>
    {#if onReset}
      <button on:click={onReset} style="margin-left:8px">Reset layout</button>
    {/if}
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

.info-panel {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 240px;
  background: rgba(0,0,0,0.35);
  padding: 8px;
  border-radius: 8px;
  z-index: 25;
}
.info-panel .tabs { display:flex; gap:6px; margin-bottom:8px }
.info-panel .tabs button { background: transparent; border: 1px solid rgba(255,255,255,0.06); color: white; padding:6px; border-radius:6px }
.info-panel .tabs button.active { background: rgba(255,255,255,0.08) }

.sticky {
  position: absolute;
  background: #fffb91;
  color: #111;
  padding: 8px;
  min-width: 120px;
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.3);
  touch-action: none;
  user-select: none;
}
.sticky-layer { position: absolute; inset: 0; }
.check-item { display:flex; align-items:center; gap:8px; padding:4px 0 }
.check-item .done { text-decoration: line-through; opacity: 0.7 }
.info-panel input[type="text"], .info-panel input[type="color"], .info-panel input[type="range"], .info-panel textarea { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.04); color: white; padding:6px; border-radius:6px }
.info-panel .checklist { display:flex; flex-direction:column; gap:6px; margin-bottom:8px; }
.info-panel .timer { margin-bottom:8px; }
.info-panel .time-display { font-family: monospace; font-size: 1.1rem; margin:6px 0; }
.info-panel textarea { width: 100%; border-radius:6px; background: rgba(255,255,255,0.03); color: white; border: none; padding:6px }

.panel-full { position:absolute; inset:0; padding:18px; box-sizing:border-box; }

.pen-toggle.bottom {
  position: absolute;
  left: 8px;
  bottom: 12px;
  z-index: 20;
  display: flex;
  gap: 8px;
  align-items: center;
}
.pen-toggle button {
  background: rgba(255,255,255,0.06);
  color: white;
  border: 1px solid rgba(255,255,255,0.08);
  padding: 6px 10px;
  border-radius: 6px;
}
.pen-toggle button.active {
  background: rgba(255,255,255,0.14);
  box-shadow: 0 2px 8px rgba(0,0,0,0.4);
}
.pen-toggle input[type="color"] {
  margin-left: 8px;
  width: 34px;
  height: 30px;
  padding: 0;
  border: none;
  background: transparent;
}
.pen-toggle input[type="range"] {
  vertical-align: middle;
  margin-left: 6px;
}
.draw-canvas { cursor: crosshair; touch-action: none; }
.draw-canvas[disabled] { cursor: default; }
</style>
