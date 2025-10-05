// pages/api/vault/update.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/db";
import VaultItem from "../../../models/VaultItem";
import { verifyToken } from "../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") return res.status(405).end();
  await dbConnect();

  const auth = req.headers.authorization?.split(" ")[1];
  const userId = auth ? verifyToken(auth) : null;
  if (!userId) return res.status(401).json({ error: "unauth" });

  const { id, ciphertext, iv } = req.body;
  if (!id || !ciphertext || !iv) return res.status(400).json({ error: "missing" });

  const item = await VaultItem.findOneAndUpdate(
    { _id: id, userId },
    { ciphertext, iv },
    { new: true }
  );

  if (!item) return res.status(404).json({ error: "not found" });
  return res.json({ ok: true });
}
