// pages/api/vault/create.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/db";
import VaultItem from "../../../models/VaultItem";
import { verifyToken } from "../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  await dbConnect();
  const auth = req.headers.authorization?.split(" ")[1];
  const userId = auth ? verifyToken(auth) : null;
  if (!userId) return res.status(401).json({ error: "unauth" });

  const { ciphertext, iv } = req.body;
  if (!ciphertext || !iv) return res.status(400).json({ error: "missing" });
  const it = await VaultItem.create({ userId, ciphertext, iv });
  return res.json({ id: it._id });
}
