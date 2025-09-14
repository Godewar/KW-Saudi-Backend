// models/Lead.js
import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },

  // Lead details (NOT KW agents)
  fullName: { type: String },
  fullname: { type: String },
  email: { type: String },
  phone: { type: String },
  mobileNumber: { type: String },
  city: { type: String },
  marketCenter: { type: String },
  message: { type: String },

  // Form-specific fields
  formType: { 
    type: String, 
    enum: ["jasmin", "jeddah", "instant-valuation", "join-us", "franchise", "contact-us"],
    required: true 
  },

  // Instant Valuation
  address: { type: String },
  bedrooms: { type: Number },
  property_type: { type: String },
  valuation_type: { type: String },

  // Franchise
  dob: { type: Date },
  educationStatus: { type: String },
  promotionalConsent: { type: Boolean, default: false },
  personalDataConsent: { type: Boolean, default: false },

  // Contact Us
  enquiryType: { type: String },

  // Flags
  isAgent: { type: Boolean, default: false },

}, { timestamps: true });

export default mongoose.model('Lead', leadSchema);
