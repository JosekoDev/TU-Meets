// src/lib/server/auth.ts
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { addUser, getUserByEmail, type User } from './users';

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm: z.string()
}).refine((d) => d.password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm']
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1)
});

export async function createUser(email: string, password: string): Promise<User> {
  const existing = getUserByEmail(email);
  if (existing) throw new Error('Email already registered');
  const passwordHash = await bcrypt.hash(password, 10);
  const user: User = {
    id: crypto.randomUUID(),
    email: email.toLowerCase(),
    passwordHash,
    createdAt: new Date()
  };
  addUser(user);
  return user;
}

export async function verifyUser(email: string, password: string): Promise<User | null> {
  const user = getUserByEmail(email);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}