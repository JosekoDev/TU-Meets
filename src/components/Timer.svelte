<script>
  import { onDestroy, createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  export let seconds = 0;
  let running = false;
  let intervalId = null;

  function start() {
    if (running) return;
    intervalId = setInterval(() => { seconds += 1; dispatch('tick', { seconds }) }, 1000);
    running = true;
  }

  function stop() {
    if (!running) return;
    clearInterval(intervalId); intervalId = null; running = false;
  }

  function reset() {
    seconds = 0; dispatch('tick', { seconds });
  }

  onDestroy(() => { if (intervalId) clearInterval(intervalId) });
</script>

<div class="timer-root">
  <div class="time-display">{Math.floor(seconds/60).toString().padStart(2,'0')}:{(seconds%60).toString().padStart(2,'0')}</div>
  <div class="controls">
    <button on:click={start}>Start</button>
    <button on:click={stop}>Stop</button>
    <button on:click={reset}>Reset</button>
  </div>
</div>

<style>
.timer-root { display:flex; flex-direction:column; gap:8px }
.time-display { font-family: monospace; font-size: 1.2rem }
.controls { display:flex; gap:6px }
</style>
