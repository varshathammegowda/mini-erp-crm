import { Router } from "express";
import {
  createCustomer,
  getCustomers,
  searchCustomers,
  updateCustomer,
  getCustomerById,
} from "../controllers/customerController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authenticateToken, createCustomer);
router.get("/", authenticateToken, getCustomers);
router.get("/search", authenticateToken, searchCustomers);
router.put("/:id", authenticateToken, updateCustomer);
router.get("/:id", authenticateToken, getCustomerById);

export default router;