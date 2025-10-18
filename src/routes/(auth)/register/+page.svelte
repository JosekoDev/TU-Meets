<script lang="ts">
  export let form: any;
</script>

<h1>Create account</h1>
<form method="POST">
  <label>Email<br /><input name="email" type="email" required value={form?.data?.email ?? ''} /></label>
  {#if form?.errors?.email}<p style="color:red">{form.errors.email}</p>{/if}

  <label>Password<br /><input name="password" type="password" required minlength="8" /></label>
  {#if form?.errors?.password}<p style="color:red">{form.errors.password}</p>{/if}

  <label>Confirm password<br /><input name="confirm" type="password" required minlength="8" /></label>
  {#if form?.errors?.confirm}<p style="color:red">{form.errors.confirm}</p>{/if}

  {#if form?.message}<p style="color:red">{form.message}</p>{/if}

  <button>Create account</button>
</form>
<p>Already have an account? <a href="/login">Log in</a></p>