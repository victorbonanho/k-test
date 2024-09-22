import express from "express";
import { registerClient, loginClient } from "../../controllers/authController";

const router = express.Router();

router.post("/register", registerClient);
router.post("/login", loginClient);

export default router;
