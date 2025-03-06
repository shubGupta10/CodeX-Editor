import mongoose, { Model, Schema } from "mongoose";

interface Feedback {
    userId: string;
    name: string;
    message: string;
}

const feedbackSchema = new Schema<Feedback>(
  {
    userId: {
      type: String,
      required: true,
    },
    name: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
  },
  { timestamps: true }
);

const FeedbackModel: Model<Feedback> =
  mongoose.models.Feedback || mongoose.model<Feedback>("Feedback", feedbackSchema);

export default FeedbackModel;
