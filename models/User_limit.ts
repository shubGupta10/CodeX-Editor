import mongoose, { Model, Schema } from "mongoose";

interface UserLimit {
    userId: string;
    fileCount: number;
    maxFiles: number;
    aiRequestCount: number; 
    aiMaxRequests: number;   
    conversionCount: number;  
    conversionLimit: number; 
    conversionResetAt: Date;  
    aiResetAt: Date;        
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
      default: 0, 
    },
    aiMaxRequests: {
      type: Number,
      default: 10, 
    },
    aiResetAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), 
    },
    conversionCount: {
      type: Number,
      default: 0,
    },
    conversionLimit: {
      type: Number,
      default: 5, 
    },
    conversionResetAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

const UserLimitModel: Model<UserLimit> =
  mongoose.models.UserLimit || mongoose.model("UserLimit", userLimitSchema);

export default UserLimitModel;
