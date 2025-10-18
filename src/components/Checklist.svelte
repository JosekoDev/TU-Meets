<script>
  import { createEventDispatcher } from 'svelte';
  export let items = [
    { id: 1, text: 'Read notes', done: false },
    { id: 2, text: 'Review problem', done: false },
    { id: 3, text: 'Summarize', done: false }
  ];
  const dispatch = createEventDispatcher();
  let newText = '';

  function add() {
    const t = newText.trim();
    if (!t) return;
    const id = Date.now();
    items = [...items, { id, text: t, done: false }];
    newText = '';
    dispatch('update', { items });
  }

  function remove(id) {
    items = items.filter(i => i.id !== id);
    dispatch('update', { items });
  }

  function toggleDone(i) {
    items = items.map(it => it.id === i.id ? { ...it, done: !it.done } : it);
    dispatch('update', { items });
  }

  function editSave(id, value) {
    items = items.map(it => it.id === id ? { ...it, text: value } : it);
    dispatch('update', { items });
  }
</script>

<div class="checklist-root">
  <div class="check-add">
    <input placeholder="New item" bind:value={newText} on:keydown={(e)=> e.key==='Enter' && add()} />
    <button on:click={add}>Add</button>
  </div>
  <div class="check-list">
    {#each items as it}
      <div class="check-row">
        <input type="checkbox" checked={it.done} on:change={() => toggleDone(it)} />
        <input class="check-text" value={it.text} on:blur={(e)=> editSave(it.id, e.target.value)} />
        <button class="small" on:click={() => remove(it.id)}>Remove</button>
      </div>
    {/each}
  </div>
</div>

<style>
.checklist-root { display:flex; flex-direction:column; gap:8px; }
.check-add { display:flex; gap:6px }
.check-row { display:flex; gap:8px; align-items:center }
.check-text { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.04); color: white; padding:4px; border-radius:4px; flex:1 }
.small { padding:4px 6px }
</style>
