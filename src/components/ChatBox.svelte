<script>
  let messages = [];
  let input = "";

  function sendMessage() {
    if (!input.trim()) return;
    messages = [...messages, { text: input.trim(), from: "You", time: new Date().toLocaleTimeString() }];
    input = "";
    // keep scroll at bottom — I might wire up bind:this later when I need auto-scroll
  }
</script>

<div class="chat-root">
  <div class="chat-messages" role="log" aria-live="polite">
    {#each messages as msg}
      <div class="chat-msg">
        <div class="meta"><strong>{msg.from}</strong> <span class="time">{msg.time}</span></div>
        <div class="text">{msg.text}</div>
      </div>
    {/each}
  </div>

  <div class="chat-input">
    <input bind:value={input} placeholder="Type a message..." on:keydown={(e) => e.key === 'Enter' && sendMessage()} />
    <button on:click={sendMessage}>Send</button>
  </div>
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
.meta { font-size: 0.85rem; color: rgba(255,255,255,0.7); }
.time { margin-left: 0.5rem; font-size: 0.75rem; color: rgba(255,255,255,0.45); }
.text { margin-top: 0.15rem; background: rgba(255,255,255,0.04); padding: 0.45rem 0.6rem; border-radius: 6px; }
.chat-input { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
.chat-input input { flex: 1; padding: 0.6rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06); background: transparent; color: inherit; }
.chat-input button { padding: 0.55rem 0.9rem; border-radius: 6px; }
</style>