import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },       // e.g., "Ahmed Jaber"
  slug: { type: String, required: true, unique: true },
  lastName: { type: String },                       // e.g., "Alamri"
  kwId: { type: String },                           // e.g., "2000068942"
  marketCenter: { type: String },                   // e.g., "KW Saudi Arabia"
  city: { type: String },                           // e.g., "Jeddah"
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  profileImage: { type: String },
  photo: { type: String },                   // e.g., "Untitled design (9).jpg"
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Agent', agentSchema);
