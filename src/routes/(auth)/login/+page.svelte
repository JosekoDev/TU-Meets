<script lang="ts">
  export let form: any;
</script>

<h1>Login</h1>
<form method="POST">
  <label>Email<br /><input name="email" type="email" required value={form?.data?.email ?? ''} /></label>
  {#if form?.errors?.email}<p style="color:red">{form.errors.email}</p>{/if}

  <label>Password<br /><input name="password" type="password" required /></label>
  {#if form?.errors?.password}<p style="color:red">{form.errors.password}</p>{/if}

  {#if form?.message}<p style="color:red">{form.message}</p>{/if}

  <button>Log in</button>
</form>
<p>No account? <a href="/register">Create one</a></p>