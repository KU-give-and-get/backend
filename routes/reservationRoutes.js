import express from "express";
import {
  createReservation,
  getReservationsByProduct,
  updateReservationStatus,
  getReservationsByUser,
} from "../controllers/reservationController.js";
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// สร้าง reservation
router.post("/", verifyToken, createReservation);

// ดู reservation ของ product
router.get("/product/:productId", verifyToken, getReservationsByProduct);

// Approve / Reject reservation
router.put("/:reservationId/status", verifyToken, updateReservationStatus);

// ดู reservation ของ user
router.get("/user", verifyToken, getReservationsByUser);
export default router;
