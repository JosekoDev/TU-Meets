<script>
	import '../global.css';

	export let data;
</script>

<nav style="display:flex; gap:1rem; padding:.75rem; border-bottom:1px solid #eee">
  <a href="/">Home</a>
  {#if data.userId}
    <a href="/protected">Protected</a>
    <a href="/logout" rel="external">Logout</a>
  {:else}
    <a href="/login">Login</a>
    <a href="/register">Register</a>
  {/if}
</nav>

<slot />