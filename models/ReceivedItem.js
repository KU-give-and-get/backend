import mongoose from "mongoose";

const receivedItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "AuthUser", required: true },
  quantity: { type: Number, required: true },
  receivedAt: { type: Date, default: Date.now },
});

export default mongoose.model("ReceivedItem", receivedItemSchema);
