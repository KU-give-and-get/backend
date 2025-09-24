import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
  description: String,
  category: String,
  imageUrl: [String], // array ของ URL
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  status: { type: String, default: 'available' },
  createdAt: { type: Date, default: Date.now },
  location: String,
  contact: {
    phone: String,
    instagram: String,
    facebook: String,
    others: String
  },
  quantity: {type: Number, default: 1}
})

export default mongoose.model('Product', productSchema)