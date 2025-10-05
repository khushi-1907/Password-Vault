// pages/api/auth/signup.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/db";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  await dbConnect();

const { email, password } = req.body;
if (!email || !password) return res.status(400).json({ error: "missing" });

const exists = await User.findOne({ email });
if (exists) return res.status(400).json({ error: "exists" });


  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const encryptionSalt = randomBytes(16).toString("base64");

    const user = await User.create({ email, passwordHash, encryptionSalt });
    console.log("User created:", user); // 👈 debug log

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server error" });
  }
}
