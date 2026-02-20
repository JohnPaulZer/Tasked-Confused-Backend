import mongoose from "mongoose";
import dns from "dns" ;
dns.setServers (["8.8.8.8", "1.1.1.1"]);

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
