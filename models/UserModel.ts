import mongoose, { Model, Schema } from "mongoose";

/**
 * Shared User interface used across the database layer.
 */
interface Users {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    profileImage?: string;
    password: string;
    isAdmin: boolean;
    provider: string;
    lastLogin: Date;
    plan?: string;
    planExpiryDate?: Date | null;
}

const userSchema = new Schema<Users>({
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String, required: true, unique: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, "Please provide a valid email address"] 
    },
    profileImage: { type: String },
    password: { type: String },
    isAdmin: { type: Boolean, required: true, default: false },
    provider: {
        type: String,
        enum: ['credentials', 'google', "github"],
      },
      lastLogin: {
        type: Date,
        default: Date.now
      },
      plan: {
        type: String,
        enum: ["free", "pro"],
        default: "free"
      },
      planExpiryDate: {
        type: Date,
        default: null
      }
}, { timestamps: true });

const User: Model<Users> = mongoose.models.User || mongoose.model<Users>("User", userSchema);

export default User;
