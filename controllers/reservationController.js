import Reservation from "../models/Reservation.js";
import Product from "../models/Product.js";

// สร้าง reservation
export const createReservation = async (req, res) => {
  try {
    const { productId, requestedQuantity } = req.body;
    const requesterId = req.user.id; // สมมติมี middleware auth

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const reservation = await Reservation.create({
      productId,
      requesterId,
      requestedQuantity,
      status: "pending",
    });

    res.status(201).json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ดู reservation ของ product
export const getReservationsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const reservations = await Reservation.find({ productId })
      .populate("requesterId", "name email") // populate user
      .sort({ createdAt: -1 });

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve / Reject reservation
export const updateReservationStatus = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { status } = req.body; // 'approved' หรือ 'rejected'

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) return res.status(404).json({ message: "Reservation not found" });

    // ถ้า approve ลด quantity ของ product
    if (status === "approved") {
      const product = await Product.findById(reservation.productId);
      if (!product) return res.status(404).json({ message: "Product not found" });

      if (product.quantity < reservation.requestedQuantity) {
        return res.status(400).json({ message: "Not enough quantity" });
      }

      product.quantity -= reservation.requestedQuantity;
      await product.save();
    }

    reservation.status = status;
    await reservation.save();

    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ดู reservation ของ user
export const getReservationsByUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const reservations = await Reservation.find({ requesterId: userId })
      .populate("productId", "name imageUrl")
      .sort({ createdAt: -1 });

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
