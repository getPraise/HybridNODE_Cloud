import mongoose from "mongoose";

/**
 * CHAT SCHEMA
 * Defines the structure for persistent AI conversations.
 * Includes automated indexing for high-speed sidebar retrieval.
 */
const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User ID is required for session mapping"],
      index: true,
    },
    title: {
      type: String,
      default: "New Conversation",
      trim: true,
    },
    messages: [
      {
        role: {
          type: String,
          enum: ["user", "assistant", "system"],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // State management for UI filtering
    isIncognito: {
      type: Boolean,
      default: false,
      index: true, // Optimized for clearing temporary logs
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically manages 'createdAt' and 'updatedAt'
  },
);

// Compound Index: Optimizes the Sidebar query (Pinned first, then most recent)
chatSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 });

/**
 * Singleton Pattern for Mongoose Models:
 * Prevents re-compilation errors during development hot-reloads.
 */
const chatModel = mongoose.models.chat || mongoose.model("chat", chatSchema);

export default chatModel;
