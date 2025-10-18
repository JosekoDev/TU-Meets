// src/lib/server/session.ts
import { randomUUID } from 'crypto';

const sessions = new Map<string, { userId: string; createdAt: Date }>();

export function createSession(userId: string) {
  const token = randomUUID();
  sessions.set(token, { userId, createdAt: new Date() });
  return token;
}

export function getSession(token?: string | null) {
  if (!token) return null;
  return sessions.get(token) ?? null;
}

export function deleteSession(token?: string | null) {
  if (!token) return;
  sessions.delete(token);
}