import express from "express";
import { createTask, getTasks, deleteTask, updateTask, getTaskById } from "../controller/taskCon";
import protectRoute from "../middlewares/protectTask";

const router = express.Router();

router.post("/", protectRoute, createTask);
router.get("/", protectRoute, getTasks);
router.delete("/:id", protectRoute, deleteTask);
router.put("/:id", protectRoute, updateTask);
router.get("/:id", protectRoute, getTaskById);

export default router;