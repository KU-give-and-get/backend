import mongoose from "mongoose";

const wishItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: String,
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ผู้รับบริจาค
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  location: String,
  contact: {
    phone: String,
    instagram: String,
    facebook: String,
    others: String
  },
  quantity: { type: Number, required: true, default: 1 },
  imageUrl: {type: String},
});

export default mongoose.model('WishItem', wishItemSchema);
