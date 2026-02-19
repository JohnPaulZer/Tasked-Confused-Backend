import mongoose, { Document, Schema } from "mongoose";

export interface ITask extends Document {
  title: string;
  time: string;
  description: string;
  category: string;
  date: Date;
  isCompleted?: boolean;
  user: mongoose.Types.ObjectId;
}

const taskSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    time: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true },
    isCompleted: { type: Boolean, default: false },
    user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export default mongoose.model<ITask>("Task", taskSchema);
