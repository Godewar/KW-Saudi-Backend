import mongoose from 'mongoose';

const seoSchema = new mongoose.Schema({
  pageName: { type: String, required: true, trim: true },
  pageSlug: { type: String, required: true, unique: true },
  metaTitle: String,
  metaDescription: String,
  metaKeywords: String, // Changed from [String] to String to match frontend
  metaAltTag: String,
}, { timestamps: true });

export default mongoose.model('SEO', seoSchema);
