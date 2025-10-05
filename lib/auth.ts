// lib/auth.ts
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
export function verifyToken(token: string) {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return payload.sub as string;
  } catch (e) {
    return null;
  }
}
