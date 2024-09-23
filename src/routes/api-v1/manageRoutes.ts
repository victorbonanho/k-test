import express from "express";
import {
  getAllClients,
  deleteClientById,
} from "../../controllers/manageController";

const router = express.Router();

router.get("/clients", getAllClients);
router.delete("/clients/:id", deleteClientById);

export default router;
