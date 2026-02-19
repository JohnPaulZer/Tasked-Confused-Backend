import express from "express";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
} from "../controller/taskCon";
import protectRoute from "../middlewares/protectTask";

const router = express.Router();

router.post("/", protectRoute, createTask); // Create new task
router.get("/", protectRoute, getTasks); // Get all user tasks
router.get("/:id", protectRoute, getTaskById); // Get specific task
router.put("/:id", protectRoute, updateTask); // Update task
router.delete("/:id", protectRoute, deleteTask); // Delete task

export default router;
