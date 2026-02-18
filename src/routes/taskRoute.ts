import express from "express";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
} from "../controller/taskCon";
import protectRoute from "../middlewares/protectTask";

/**
 * TASK ROUTES
 * All task CRUD operations for authenticated users
 * Base path: /api/tasks
 * Security: All routes require valid JWT token (protectRoute middleware)
 */
const router = express.Router();

/**
 * POST /api/tasks
 * Create a new task
 * Requires: JWT token
 * Body: { title, time, description, category, date }
 * Returns: { message, task: Task }
 */
router.post("/", protectRoute, createTask);

/**
 * GET /api/tasks
 * Retrieve all tasks for authenticated user
 * Requires: JWT token
 * Query: None
 * Returns: { tasks: Task[] } - sorted by date ascending
 */
router.get("/", protectRoute, getTasks);

/**
 * GET /api/tasks/:id
 * Retrieve a specific task by ID
 * Requires: JWT token + ownership verification
 * Params: id - MongoDB task ID
 * Returns: { task: Task }
 * Error: 404 if task not found or unauthorized
 */
router.get("/:id", protectRoute, getTaskById);

/**
 * PUT /api/tasks/:id
 * Update an existing task
 * Requires: JWT token + ownership verification
 * Params: id - MongoDB task ID
 * Body: { title?, time?, description?, category?, date?, isCompleted? }
 * Returns: { message, task: updated Task }
 * Error: 404 if task not found or unauthorized
 */
router.put("/:id", protectRoute, updateTask);

/**
 * DELETE /api/tasks/:id
 * Permanently delete a task
 * Requires: JWT token + ownership verification
 * Params: id - MongoDB task ID
 * Returns: { message: "Task deleted successfully" }
 * Error: 404 if task not found or unauthorized
 */
router.delete("/:id", protectRoute, deleteTask);

export default router;
