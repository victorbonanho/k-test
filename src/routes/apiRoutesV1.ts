import express from "express";
import authRoutes from "./api-v1/authRoutes.js";
import chatRoutes from "./api-v1/chatRoutes.js";

const router = express.Router();

//core routes
router.use("/auth", authRoutes);
router.use("/chat", chatRoutes);

export default router;
