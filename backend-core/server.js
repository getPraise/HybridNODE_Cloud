import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose"; // Added for graceful DB disconnect
import connectDB from "./app/core/mongodb.js";
import authRouter from "./app/api/authRoutes.js";
import userRouter from "./app/api/userRoutes.js";
import chatRouter from "./app/api/chatRoutes.js";

// Initialize Database
connectDB();

const app = express();
const PORT = process.env.PORT || 4000;

// --- 1. MIDDLEWARE STACK ---
app.use(
  cors({
    origin: [
      "https://hybrid-node-cloud.vercel.app", // Your Production URL
      "http://localhost:5173",                // Your Local URL
      "http://localhost:3000"                 // Optional: fallback
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// --- 2. API ROUTES ---
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "Active",
    timestamp: new Date().toISOString(),
    node: "HybridNode_Core_V1",
  });
});

// --- 3. GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error(`[SERVER ERROR] ${err.stack}`);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// --- 4. START SERVER ---
const server = app.listen(PORT, () => {
  console.log(`
    -------------------------------------------------
    🚀 HYBRID-NODE GATEWAY : http://localhost:${PORT}
    🌐 ALLOWED ORIGIN      : ${FRONTEND_URL}
    📂 DATABASE STATUS     : INITIALIZED
    -------------------------------------------------
  `);
});

// Graceful Shutdown (Professional touch for Docker/Cloud)
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("HTTP server closed.");
  });
  await mongoose.connection.close();
  console.log("MongoDB connection closed.");
  process.exit(0);
});
