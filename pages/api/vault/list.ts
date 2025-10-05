// pages/api/vault/list.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/db";
import VaultItem from "../../../models/VaultItem";
import { verifyToken } from "../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();
  await dbConnect();
  const auth = req.headers.authorization?.split(" ")[1];
  const userId = auth ? verifyToken(auth) : null;
  if (!userId) return res.status(401).json({ error: "unauth" });

  const items = await VaultItem.find({ userId }).sort({ createdAt: -1 }).lean();
  return res.json(items.map(i => ({ id: i._id, ciphertext: i.ciphertext, iv: i.iv })));
}
