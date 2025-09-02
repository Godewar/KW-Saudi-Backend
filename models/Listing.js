// import mongoose from 'mongoose';

// const serviceSchema = new mongoose.Schema({
//   title: { type: String, required: true }, // Example: "3BHK Apartment in Andheri"
//   slug: { type: String, required: true, unique: true }, // For SEO-friendly URLs
//   description: { type: String, required: true },
//   type: {
//     type: String,
//     enum: ['apartment', 'villa', 'plot', 'office', 'shop', 'warehouse'],
//     required: true,
//   },
//   purpose: {
//     type: String,
//     enum: ['commercial', 'residential'],
//     required: true,
//   },
//   price: { type: Number, required: true },
//   areaSqFt: { type: Number }, // area in square feet
//   bedrooms: { type: Number },
//   bathrooms: { type: Number },
//   furnished: {
//     type: String,
//     enum: ['furnished', 'semi-furnished', 'unfurnished'],
//   },
//   location: {
//     address: String,
//     city: String,
//     state: String,
//     country: String,
//     pincode: String,
//     coordinates: {
//       lat: Number,
//       lng: Number
//     }
//   },
//   contentImage: [String], // Array of image URLs
//   amenities: [String], // Example: ["Lift", "Power Backup", "Swimming Pool"]
//   contact: {
//     name: String,
//     phone: String,
//     email: String,
//   },
//   isFeatured: { type: Boolean, default: false },
//   status: {
//     type: String,
//     enum: ['available', 'commercial', 'residential'],
//     default: 'available'
//   },
// }, { timestamps: true });

// export default mongoose.model('Services', serviceSchema);


import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  title: { type: String }, // Optional title
  slug: { type: String, unique: true }, // for clean URL
  marketCenter: { type: String },
  city: { type: String },
  address: { type: String },
  locationCode: { type: String }, // e.g. 9C6G+643 or 4319 RRRC4319
  price: { type: Number }, // In SAR
  propertyType: { type: String }, // e.g. Residential, Commercial, Lots And Land
  propertySubType: { type: String },

  bedrooms: { type: Number },
  bathrooms: { type: Number },
  areaSize: { type: Number }, // in sqft or sqm

  agent: {
    name: { type: String },
    photo: { type: String } // agent image
  },

  images: [String], // Array of listing images

  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Listing', listingSchema);
