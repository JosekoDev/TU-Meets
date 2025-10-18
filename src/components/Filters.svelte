<script>
  export let filters;
</script>

<div style="margin: 1rem 0;">
  <input placeholder="Major" bind:value={filters.major} style="margin-right: 0.5rem;" />
  <input placeholder="Year" bind:value={filters.year} style="margin-right: 0.5rem;" />
  <input placeholder="Subject" bind:value={filters.subject} />
</div>