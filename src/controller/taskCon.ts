import e, { Request, Response } from "express";
import Task from "../models/task";


export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, time, description, category, date } = req.body;
    const userId = (req as any).userId; // Assuming you have user authentication in place

    // Create a new task
    const newTask = new Task({
      title,
      time,
        description,
        category,
        date: new Date(date), // Convert date string to Date object
        user: userId, // Associate task with the user
    });

    await newTask.save();
    res.status(201).json({ message: "Task created successfully", task: newTask });
  }
    catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Failed to create task" });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // Assuming you have user authentication in place
    const tasks = await Task.find({ user: userId }).sort({ date: 1 }); // Get tasks for the user, sorted by date
    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }     
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const userId = (req as any).userId; // Assuming you have user authentication in place   
    const deletedTask = await Task.findOneAndDelete({ _id: taskId, user: userId }); // Ensure user can only delete their own tasks
    if (!deletedTask) {
        return res.status(404).json({ message: "Task not found or unauthorized" });
    }
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Failed to delete task" });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const userId = (req as any).userId; // Assuming you have user authentication in place
    const { title, time, description, category, date, isCompleted } = req.body;
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, user: userId }, // Ensure user can only update their own tasks
      { title, time, description, category, date, isCompleted },
        { new: true } // Return the updated document    
    );
    if (!updatedTask) {
        return res.status(404).json({ message: "Task not found or unauthorized" });
    }       

    res.status(200).json({ message: "Task updated successfully", task: updatedTask });
    } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Failed to update task" });
  } 
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const userId = (req as any).userId; // Assuming you have user authentication in place
    const task = await Task.findOne({ _id: taskId, user: userId }); // Ensure user can only access their own tasks
    if (!task) {
        return res.status(404).json({ message: "Task not found or unauthorized" });
    }
    res.status(200).json({ task });
    } catch (error) {   
    console.error("Error fetching task:", error);
    res.status(500).json({ message: "Failed to fetch task" });
  }
};
