import mongoose from "mongoose";

// Initialize MongoDB connection and configure strict query mode
export default async function initDB() {
  try {
    mongoose.set("strictQuery", true);
    mongoose.set("strict", true);
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    return;
  }
}
