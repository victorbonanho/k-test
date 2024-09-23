import express from "express";
import authRoutes from "./api-v1/authRoutes.js";
import chatRoutes from "./api-v1/chatRoutes.js";
import manageRoutes from "./api-v1/manageRoutes.js";

const router = express.Router();

//core routes
router.use("/auth", authRoutes);
router.use("/chat", chatRoutes);
router.use("/manage", manageRoutes);

export default router;
