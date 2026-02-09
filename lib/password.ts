// lib/password.ts
import bcrypt from 'bcryptjs';

export const saltAndHashPassword = async (password: string) => {
  const hash = await bcrypt.hash(password, 10);
  return hash;
};

export const verifyPassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
}
