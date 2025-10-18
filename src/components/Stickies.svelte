<script>
  import { createEventDispatcher } from 'svelte';
  export let items = [];
  export let onReset = undefined;
  const dispatch = createEventDispatcher();
  let newText = '';

  function add() {
    const t = newText.trim();
    if (!t) return;
    const id = Date.now();
    items = [...items, { id, text: t, x: 80, y: 80 }];
    newText = '';
    dispatch('update', { items });
  }

  function remove(id) {
    items = items.filter(i => i.id !== id);
    dispatch('update', { items });
  }

  // dragging is handled by parent for bounding; parent should update items as they move
  function startDrag(e, it) {
    dispatch('dragstart', { id: it.id, event: e });
  }

  function clearStickies() {
    items = [];
    dispatch('update', { items });
  }

</script>

<div class="stickies-root">
  <div style="display:flex;gap:6px">
    <input placeholder="Note text" bind:value={newText} on:keydown={(e)=> e.key==='Enter' && add()} />
    <button on:click={add}>Add</button>
  </div>
  <div class="stickies-list" style="margin-top:8px">
    {#each items as it}
      <div class="sticky-row">
        <div class="sticky-text">{it.text}</div>
        <div style="margin-left:auto;display:flex;gap:6px">
          <button class="small" on:click={()=> remove(it.id)}>Remove</button>
        </div>
      </div>
    {/each}
</div>
</div>

<style>
.stickies-root { display:flex; flex-direction:column; gap:8px }
.sticky-row { display:flex; gap:8px; align-items:center }
.sticky-text { background: rgba(255,255,255,0.03); padding:6px; border-radius:4px }
.small { padding:4px 6px }
</style>
