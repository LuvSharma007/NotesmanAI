import mongoose from "mongoose";

const mongodbUrl = process.env.MONGODB_URL!;
const mongodbName = process.env.MONGODB_NAME!;

if (!mongodbUrl || !mongodbName) {
  throw new Error("MongoDB URL and DB name are required");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      dbName: mongodbName,
      bufferCommands: true,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(mongodbUrl, opts).then((m) => m.connection);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
