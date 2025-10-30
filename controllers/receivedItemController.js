import ReceivedItem from "../models/ReceivedItem.js";
import Reservation from "../models/Reservation.js";
import Product from "../models/Product.js";
import jwt from 'jsonwebtoken'
import AuthUser from '../models/AuthUser.js'

// เพิ่ม received item
export const createReceivedItem = async (req, res) => {
  try {
    const { reservationId, quantity } = req.body; // middleware verifyToken ต้องมี user

    // หา reservation
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) return res.status(404).json({ message: "Reservation not found" });

    // ดึง requesterId
    const receiverId = reservation.requesterId._id; // ✅ ใช้ requesterId แทน receiverId

    // เช็ค quantity
    if (quantity > reservation.requestedQuantity)
      return res.status(400).json({ message: "Quantity exceeds reserved amount" });

    // สร้าง received item
    const receivedItem = await ReceivedItem.create({
      productId: reservation.productId,
      receiverId,
      quantity,
    });

    res.status(201).json(receivedItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ดู received items ของ user
export const getReceivedItemsByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const items = await ReceivedItem.find({ receiverId: userId })
      .populate("productId", "name imageUrl")
      .sort({ receivedAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ดู received items ของ product
export const getReceivedItemsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const items = await ReceivedItem.find({ productId })
      .populate("receiverId", "name email")
      .sort({ receivedAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getReceivedItemByUserId = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, process.env.JWT_SECRET);

    const { userId } = req.params;
    const items = await ReceivedItem.find({ receiverId: userId })
      .sort({ receivedAt: -1 })
      .populate("productId", "name imageUrl"); // แนะนำให้ populate ชื่อสินค้าเลย

    res.json(items);
  } catch (error) {
    console.error("Get received items error:", error);
    res.status(500).json({ message: error.message });
  }
};



export const getUserById = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, process.env.JWT_SECRET); // ตรวจ token valid

    const { userId } = req.params;
    const user = await AuthUser.findById(userId).select("-password -__v");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
