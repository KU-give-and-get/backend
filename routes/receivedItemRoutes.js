import express from "express";
import {
  createReceivedItem,
  getReceivedItemsByUser,
  getReceivedItemsByProduct,
  getUserById,
  getReceivedItemByUserId,
} from "../controllers/receivedItemController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// เพิ่ม received item
router.post("/", verifyToken, createReceivedItem);

// ดู received items ของ user
router.get("/user", verifyToken, getReceivedItemsByUser);

// ดู received items ของ product
router.get("/product/:productId", verifyToken, getReceivedItemsByProduct);

router.get('/receiver/:userId', verifyToken, getUserById);

router.get('/receiver/product/:userId', verifyToken, getReceivedItemByUserId)

export default router;
