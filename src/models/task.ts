import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  time: string;
  description: string;
  category: string;
  date: Date;
  isCompleted?: boolean;
  user: mongoose.Types.ObjectId; // Reference to User
}

const taskSchema: Schema = new Schema({
  title: { type: String, required: true },
  time: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true },
  isCompleted: { type: Boolean, default: false },
  user: { type: mongoose.Types.ObjectId, ref: "User", required: true }, // Reference to User
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

export default mongoose.model<ITask>("Task", taskSchema);