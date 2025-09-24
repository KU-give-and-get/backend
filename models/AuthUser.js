import mongoose from "mongoose";

const authUserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true},
  password: String,
  googleId: { type: String, unique: true, sparse: true},
  provider: { type: String, enum: ['local', 'google'], required: true},
  createdAt: {type: Date, default: Date.now},
  isVerified: { type: Boolean, default: false },
  faculty: { type: String, default: "" },         
  major: { type: String, default: "" },            
  isLoan: { type: Boolean, default: false },       
  profileImageUrl: { type: String, default: "" } 
});

export default mongoose.model('AuthUser', authUserSchema)