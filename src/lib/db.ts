import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI as string;

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error :", err);
    process.exit(1);
  }
}
