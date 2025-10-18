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
<<<<<<< HEAD
  .chat-root { display:flex; flex-direction:column; height:100%; }
  .msg-list { flex:1; overflow:auto; padding:0.5rem; display:flex; flex-direction:column; gap:0.5rem; }
  .msg { max-width:80%; padding:0.4rem 0.6rem; border-radius:8px; }
  .msg.me { margin-left:auto; background:#0b84ff; color:white; }
  .msg.them { margin-right:auto; background:#222; color:#eee; }
  .meta { font-size:0.7rem; opacity:0.8; margin-bottom:0.2rem; }
  .composer { display:flex; gap:0.5rem; padding:0.5rem; border-top:1px solid rgba(255,255,255,0.03); }
  input { flex:1; padding:0.5rem; border-radius:6px; background:#111; color:#fff; border:1px solid rgba(255,255,255,0.04); }
  button { padding:0.4rem 0.8rem; border-radius:6px; background:#0b84ff; color:white; border:none; }
=======
.chat-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0.75rem;
  box-sizing: border-box;
}
.chat-messages {
  flex: 1 1 auto;
  overflow-y: auto;
  padding-right: 0.5rem;
}
.chat-msg {
  margin-bottom: 0.5rem;
}
.meta { 
  font-size: 0.85rem; 
  color: rgba(255,255,255,0.7); 
}

.time { 
  margin-left: 0.5rem; 
  font-size: 0.75rem; 
  color: rgba(255,255,255,0.45); 
  font-family: "Geist", sans-serif;
  font-optical-sizing: auto;
  font-weight: 200;
  font-style: normal;
}
.text { 
  margin-top: 0.15rem; 
  background: rgba(255,255,255,0.04); 
  padding: 0.45rem 0.6rem; 
  border-radius: 6px; 
  font-family: "Geist", sans-serif;
  font-optical-sizing: auto;
  font-weight: 200;
  font-style: normal;
}
.chat-input { 
  display: flex; 
  gap: 0.5rem; 
  margin-top: 0.5rem; 
  font-family: "Geist", sans-serif;
  font-optical-sizing: auto;
  font-weight: 200;
  font-style: normal;
}
.chat-input input { 
  flex: 1; 
  padding: 0.6rem; 
  border-radius: 6px; 
  border: 1px solid rgba(255,255,255,0.06); 
  background: transparent; 
  color: inherit; 
  font-family: "Geist", sans-serif;
  font-optical-sizing: auto;
  font-weight: 200;
  font-style: normal;
}
.chat-input button { padding: 0.55rem 0.9rem; border-radius: 6px; }
>>>>>>> c4ee25f51d0a7a1f78ac3b90107ed7422ec3d765
</style>