<script>
  export let filters;

  function handleClick() {
    alert(`Searching with filters:
Major: ${filters.major}
Year: ${filters.year}
Subject: ${filters.subject}`);
  }
</script>

<button on:click={handleClick} style="padding: 0.5rem 1rem; font-size: 1rem;">
  Find a Study Buddy
</button>