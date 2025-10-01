import mongoose from "mongoose";
const reservationSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'AuthUser', required: true },
  requestedQuantity: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('reservation',reservationSchema)