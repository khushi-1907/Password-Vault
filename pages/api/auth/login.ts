// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/db";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("Please set JWT_SECRET in .env");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  await dbConnect();
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "missing" });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "invalid" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "invalid" });

  const token = jwt.sign({ sub: user._id.toString() }, JWT_SECRET, { expiresIn: "7d" });
  // return token + encryptionSalt (salt is not secret)
  return res.json({ token, encryptionSalt: user.encryptionSalt });
}
