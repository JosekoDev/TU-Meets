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
</style>