import mongoose, { Model, Schema } from "mongoose";

interface UserLimit {
    userId: string;
    fileCount: number;
    maxFiles: number;
    aiRequestCount: number;  // New field for AI request tracking
    aiMaxRequests: number;   // Maximum AI requests allowed
    aiResetAt: Date;         // Timestamp for AI rate limit reset
    createdAt: Date;
    updatedAt: Date;
}

const userLimitSchema = new Schema<UserLimit>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    fileCount: {
      type: Number,
      default: 0,
    },
    maxFiles: {
      type: Number,
      default: 0,
    },
    aiRequestCount: {
      type: Number,
      default: 0, // Tracks AI usage
    },
    aiMaxRequests: {
      type: Number,
      default: 10, // Example: Allow 10 AI requests per day
    },
    aiResetAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // Resets every 24h
    },
  },
  { timestamps: true }
);

const UserLimitModel: Model<UserLimit> =
  mongoose.models.UserLimit || mongoose.model("UserLimit", userLimitSchema);

export default UserLimitModel;
