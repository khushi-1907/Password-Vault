// lib/db.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("Please add MONGODB_URI to .env");

let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = (global as any).__mongo_cache || { conn: null, promise: null };
if (!cached) (global as any).__mongo_cache = cached;

export default async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
