import mongoose from "mongoose";
import "dotenv/config";

/**
 * MONGODB CONNECTION MANAGER
 * logic: Initializes a pooled connection to the HybridNode cluster.
 */
const connectDB = async () => {
  // 1. Guard Clause for Environment Variables
  if (!process.env.MONGODB_URI) {
    console.error("❌ CRITICAL: MONGODB_URI missing from environment config.");
    process.exit(1);
  }

  // 2. Connection Event Listeners
  mongoose.connection.on("connected", () => {
    console.log("📂 DATABASE : ONLINE (HYBRID-NODE CLUSTER)");
  });

  mongoose.connection.on("error", (err) => {
    console.error(`[DATABASE ERROR]: ${err.message}`);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ DATABASE : DISCONNECTED (RETRYING...)");
  });

  // 3. Connection Execution
  try {
    // We set strictQuery to ensure database integrity
    mongoose.set("strictQuery", true);

    await mongoose.connect(process.env.MONGODB_URI, {
      // Professional pooling for high-concurrency (AI chats)
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  } catch (error) {
    console.error(`[DATABASE CONNECTION FAILED]: ${error.message}`);
    // In production, we might want to notify an error tracking service here
  }
};

export default connectDB;
