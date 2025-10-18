import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { loginSchema, verifyUser } from '$lib/server/auth';
import { createSession } from '$lib/server/session';

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.userId) throw redirect(302, '/');
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const form = Object.fromEntries(await request.formData());
    const parsed = loginSchema.safeParse({
      email: String(form.email ?? ''),
      password: String(form.password ?? '')
    });

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const e of parsed.error.issues) {
        const key = e.path[0] as string;
        if (!errors[key]) errors[key] = e.message;
      }
      return fail(400, { data: { email: form.email }, errors });
    }

    const user = await verifyUser(parsed.data.email, parsed.data.password);
    if (!user) {
      return fail(400, { data: { email: parsed.data.email }, message: 'Invalid email or password' });
    }

    const token = createSession(user.id);
    cookies.set('session', token, { path: '/', httpOnly: true, sameSite: 'lax', secure: false, maxAge: 60 * 60 * 24 * 7 });
    throw redirect(303, '/protected');
  }
};