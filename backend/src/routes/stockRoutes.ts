import { Router } from "express";
import {
  addStock,
  removeStock,
  getStockMovements,
} from "../controllers/stockController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/in", authenticateToken, addStock);
router.post("/out", authenticateToken, removeStock);
router.get("/movements", authenticateToken, getStockMovements);

export default router;