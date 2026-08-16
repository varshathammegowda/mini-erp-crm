import { Router } from "express";

import {
  createChallan,
  getChallans,
  getChallanById,
  cancelChallan,
} from "../controllers/challanController";

import {
  authenticateToken,
} from "../middleware/authMiddleware";

const router = Router();

router.post(
  "/",
  authenticateToken,
  createChallan
);

router.get(
  "/",
  authenticateToken,
  getChallans
);

router.get(
  "/:id",
  authenticateToken,
  getChallanById
);

router.patch(
  "/:id/cancel",
  authenticateToken,
  cancelChallan
);

export default router;