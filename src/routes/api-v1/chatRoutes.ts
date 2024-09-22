import express from "express";
import { chatWithClient } from "../../controllers/chatController";
import { verifyToken } from "../../middlewares/authMiddleware";

const router = express.Router();

router.post("/conversation", verifyToken, chatWithClient);

export default router;
