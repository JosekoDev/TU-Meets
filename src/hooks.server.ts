// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { getSession } from '$lib/server/session';

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('session');
  const sess = getSession(token);

  // expose session.userId to server load/actions
  event.locals.userId = sess?.userId ?? null;

  return resolve(event);
};

declare module '@sveltejs/kit' {
  interface Locals {
    userId: string | null;
  }
}