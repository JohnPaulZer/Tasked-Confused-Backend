import { Request, Response } from "express";
import Task from "../models/task";

// ============================================================================
// TASK CONTROLLER
// Handles CRUD operations for user tasks
// All functions require authenticated user (protectRoute middleware)
// ============================================================================

/**
 * CREATE TASK
 * POST /api/tasks
 * Creates a new task for the authenticated user
 * @param {Request} req - Request object with task data: { title, time, description, category, date }
 * @param {Response} res - Response with newly created task
 * @security Requires valid JWT token (protectRoute middleware)
 * @returns {Object} { message: string, task: Task }
 */
export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, time, description, category, date } = req.body;
    const userId = (req as any).userId; // Extracted from JWT token by protectRoute

    // Create new task document
    const newTask = new Task({
      title,
      time,
      description,
      category,
      date: new Date(date), // Convert string to Date object
      user: userId, // Associate task with authenticated user
    });

    // Save to MongoDB
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

/**
 * GET ALL TASKS
 * GET /api/tasks
 * Retrieves all tasks for the authenticated user, sorted by date
 * @param {Request} req - Express request object
 * @param {Response} res - Response with array of tasks
 * @security Requires valid JWT token (protectRoute middleware)
 * @returns {Object} { tasks: Task[] } - sorted by date ascending
 */
export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // Extracted from JWT token

    // Fetch all tasks for user, sorted by date (earliest first)
    const tasks = await Task.find({ user: userId }).sort({ date: 1 });

    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

/**
 * GET TASK BY ID
 * GET /api/tasks/:id
 * Retrieves a specific task by ID (only if it belongs to authenticated user)
 * @param {Request} req - Request object with task ID in params
 * @param {Response} res - Response with single task object
 * @security Requires valid JWT token + ownership verification
 * @returns {Object} { task: Task }
 * @throws Returns 404 if task not found or unauthorized
 */
export const getTaskById = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const userId = (req as any).userId; // Extracted from JWT token

    // Fetch task only if it belongs to authenticated user (security)
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

/**
 * UPDATE TASK
 * PUT /api/tasks/:id
 * Updates an existing task with new data
 * @param {Request} req - Request with task ID in params and updated fields in body
 * @param {Response} res - Response with updated task object
 * @security Requires valid JWT token + ownership verification
 * @returns {Object} { message: string, task: Task }
 * @throws Returns 404 if task not found or user unauthorized
 */
export const updateTask = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const userId = (req as any).userId; // Extracted from JWT token
    const { title, time, description, category, date, isCompleted } = req.body;

    // Update task only if it belongs to authenticated user (security)
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, user: userId },
      { title, time, description, category, date, isCompleted },
      { new: true }, // Return the updated document
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

/**
 * DELETE TASK
 * DELETE /api/tasks/:id
 * Permanently deletes a task from database
 * @param {Request} req - Request object with task ID in params
 * @param {Response} res - Response with success message
 * @security Requires valid JWT token + ownership verification
 * @returns {Object} { message: string }
 * @throws Returns 404 if task not found or user unauthorized
 */
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const userId = (req as any).userId; // Extracted from JWT token

    // Delete task only if it belongs to authenticated user (security)
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
