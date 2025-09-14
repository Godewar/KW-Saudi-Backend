import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  contentImage: { type: String }, // image path
  excerpt: { type: String },
  author: { type: String },
  tags: [String],
  category: { type: String },
  coverImage: { type: String }, // image path
  // Location and date fields (for news forms)
  location: { type: String },
  eventDate: { type: Date },
  // Multiple images support
  additionalImages: [{ type: String }], // array of image paths
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('News', newsSchema);
