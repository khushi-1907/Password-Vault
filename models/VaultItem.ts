// models/VaultItem.ts
import mongoose from "mongoose";

const VaultItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ciphertext: { type: String, required: true }, // base64
  iv: { type: String, required: true }, // base64
}, { timestamps: true });

export default mongoose.models.VaultItem || mongoose.model("VaultItem", VaultItemSchema);
