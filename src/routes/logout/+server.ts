// src/routes/logout/+server.ts
import type { RequestHandler } from './$types';
import { deleteSession } from '$lib/server/session';

export const GET: RequestHandler = async ({ cookies }) => {
  const token = cookies.get('session');
  deleteSession(token);
  cookies.delete('session', { path: '/' });
  return new Response(null, { status: 302, headers: { location: '/' } });
};