import { Router } from "express";
import { addFollowUp } from "../controllers/followupController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.post(
  "/customers/:customerId/followups",
  authenticateToken,
  addFollowUp
);

export default router;