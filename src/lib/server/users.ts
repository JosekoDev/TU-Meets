// src/lib/server/users.ts
export type User = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

const users = new Map<string, User>(); // key by email for quick lookup

export function getUserByEmail(email: string): User | undefined {
  return users.get(email.toLowerCase());
}

export function addUser(user: User) {
  users.set(user.email.toLowerCase(), user);
}