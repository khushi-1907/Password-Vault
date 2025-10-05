// models/User.ts
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  encryptionSalt: { type: String, required: true }, // base64
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
