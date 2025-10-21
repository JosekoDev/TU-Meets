<script lang="ts">
  import { createEventDispatcher, afterUpdate } from 'svelte';
  const dispatch = createEventDispatcher();

  export let messages: { from: string; text: string }[] = [];

  let newMessage = '';
  let listEl: HTMLDivElement | null = null;
  let inputEl: HTMLInputElement | null = null;

  function submit() {
    const text = newMessage.trim();
    if (!text) return;
    dispatch('send', text);
    newMessage = '';
    inputEl?.focus();
  }

  // auto-scroll to bottom when messages change
  afterUpdate(() => {
    if (!listEl) return;
    listEl.scrollTo({ top: listEl.scrollHeight, behavior: 'smooth' });
  });
</script>

<div class="chat-root" role="region" aria-label="Chat">
  <div class="msg-list" bind:this={listEl}>
    {#each messages as m (m)}
      <div class="msg {m.from === 'you' ? 'me' : 'them'}" role="article" aria-label="{m.from === 'you' ? 'You' : 'Partner'} message">
        <div class="meta">{m.from === 'you' ? 'You' : 'Partner'}</div>
        <div class="text">{m.text}</div>
      </div>
    {/each}
  </div>

  <form on:submit|preventDefault={submit} class="composer" aria-label="Send message">
    <input
      bind:this={inputEl}
      bind:value={newMessage}
      placeholder="Type a message..."
      aria-label="Message"
      autocomplete="off"
    />
    <button type="submit" aria-label="Send">Send</button>
  </form>
</div>

<style>
.chat-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
  gap: 0.5rem;
}

/* message list */
.msg-list {
  flex: 1 1 auto;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-right: 0.25rem;
}

/* message bubble */
.msg {
  max-width: 80%;
  display: inline-block;
}
.msg .meta {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.7);
  margin-bottom: 0.15rem;
}
.msg .text {
  background: rgba(255,255,255,0.04);
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  word-break: break-word;
  line-height: 1.2;
}

/* alignment for you vs partner */
.msg.me {
  align-self: flex-end;
  text-align: right;
}
.msg.me .text {
  background: #0b84ff;
  color: white;
}
.msg.them {
  align-self: flex-start;
  text-align: left;
}
.msg.them .text {
  background: rgba(255,255,255,0.04);
  color: inherit;
}

/* composer */
.composer {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.composer input {
  flex: 1;
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.06);
  background: transparent;
  color: inherit;
  outline: none;
}
.composer input:focus {
  box-shadow: 0 0 0 3px rgba(11,132,255,0.12);
}
.composer button {
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  border: none;
  background: #0b84ff;
  color: white;
  cursor: pointer;
}
.composer button:active { transform: translateY(1px); }
</style>