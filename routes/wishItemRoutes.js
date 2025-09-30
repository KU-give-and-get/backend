import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { 
  createWishItem,
  deleteWishItem,
  getWishItemById,
  getWishItems,
  getWishItemsByRecipientId,
  updateWishItem,
  updateWishItemStatus
} from '../controllers/wishItemController.js';
import upload from '../middleware/multer.js';

const router = express.Router();

router.post("/", verifyToken, upload.single("image"), createWishItem);

router.get("/", getWishItems);

router.get("/my-wishitems", verifyToken, getWishItemsByRecipientId);

router.patch("/:id/status", verifyToken, updateWishItemStatus);

router.get("/:id", getWishItemById);

router.put("/:id",upload.single("image"),verifyToken, updateWishItem);

router.delete("/:id", verifyToken, deleteWishItem);

export default router;
