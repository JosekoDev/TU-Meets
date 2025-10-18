<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let messages: { from: string; text: string }[] = [];

  let newMessage = '';

  function submit() {
    const text = newMessage.trim();
    if (!text) return;
    // emit plain string as detail
    dispatch('send', text);
    newMessage = '';
  }
</script>

<div class="chat-root">
  <div class="msg-list">
    {#each messages as m}
      <div class="msg {m.from === 'you' ? 'me' : 'them'}">
        <div class="meta">{m.from === 'you' ? 'You' : m.from}</div>
        <div class="text">{m.text}</div>
      </div>
    {/each}
  </div>

  <form on:submit|preventDefault={submit} class="composer">
    <input bind:value={newMessage} placeholder="Type a message..." />
    <button type="submit">Send</button>
  </form>
</div>

<style>
  .chat-root { display:flex; flex-direction:column; height:100%; }
  .msg-list { flex:1; overflow:auto; padding:0.5rem; display:flex; flex-direction:column; gap:0.5rem; }
  .msg { max-width:80%; padding:0.4rem 0.6rem; border-radius:8px; }
  .msg.me { margin-left:auto; background:#0b84ff; color:white; }
  .msg.them { margin-right:auto; background:#222; color:#eee; }
  .meta { font-size:0.7rem; opacity:0.8; margin-bottom:0.2rem; }
  .composer { display:flex; gap:0.5rem; padding:0.5rem; border-top:1px solid rgba(255,255,255,0.03); }
  input { flex:1; padding:0.5rem; border-radius:6px; background:#111; color:#fff; border:1px solid rgba(255,255,255,0.04); }
  button { padding:0.4rem 0.8rem; border-radius:6px; background:#0b84ff; color:white; border:none; }
</style>