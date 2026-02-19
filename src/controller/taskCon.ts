import { Request, Response } from "express";
import Task from "../models/task";

// Create a new task for authenticated user
export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, time, description, category, date } = req.body;
    const userId = (req as any).userId;
    const newTask = new Task({
      title,
      time,
      description,
      category,
      date: new Date(date),
      user: userId,
    });
    await newTask.save();

    res.status(201).json({
      message: "Task created successfully",
      task: newTask,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Failed to create task" });
  }
};

// Fetch all tasks for authenticated user sorted by date
export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const tasks = await Task.find({ user: userId }).sort({ date: 1 });

    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

// Fetch specific task if it belongs to authenticated user
export const getTaskById = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const userId = (req as any).userId;
    const task = await Task.findOne({
      _id: taskId,
      user: userId,
    });

    if (!task) {
      return res
        .status(404)
        .json({ message: "Task not found or unauthorized" });
    }

    res.status(200).json({ task });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ message: "Failed to fetch task" });
  }
};

// Update task with new data if user owns it
export const updateTask = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const userId = (req as any).userId;
    const { title, time, description, category, date, isCompleted } = req.body;
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, user: userId },
      { title, time, description, category, date, isCompleted },
      { new: true },
    );

    if (!updatedTask) {
      return res
        .status(404)
        .json({ message: "Task not found or unauthorized" });
    }

    res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Failed to update task" });
  }
};

// Delete task permanently if user owns it
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const userId = (req as any).userId;
    const deletedTask = await Task.findOneAndDelete({
      _id: taskId,
      user: userId,
    });

    if (!deletedTask) {
      return res
        .status(404)
        .json({ message: "Task not found or unauthorized" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Failed to delete task" });
  }
};
