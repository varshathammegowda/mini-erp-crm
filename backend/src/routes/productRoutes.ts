import { Router } from "express";
import {
  createProduct,
  getProducts,
  updateProduct,
} from "../controllers/productController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authenticateToken, createProduct);
router.get("/", authenticateToken, getProducts);
router.put("/:id", authenticateToken, updateProduct);

export default router;