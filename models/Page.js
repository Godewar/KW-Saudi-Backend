import mongoose from 'mongoose';

// const subsectionSchema = new mongoose.Schema({
//   heading: { type: String, required: true },
//   body: { type: String, required: true },
// });

const pageSchema = new mongoose.Schema({
  pageName: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, required: true,  trim: true },
  // title: { type: String, trim: true },
  // description: { type: String, trim: true },
  // h1: { type: String, trim: true },
  // h2: { type: String, trim: true },
  // h3: { type: String, trim: true },
  // h4: { type: String, trim: true },
  // h5: { type: String, trim: true },
  // h6: { type: String, trim: true },
  // // subsections: [subsectionSchema],
  // content: { type: String, trim: true },
  // primaryColor: { type: String, trim: true },
  // secondaryColor: { type: String, trim: true },
  // contentImage: { type: String, trim: true },
  // backgroundColor: { type: String, trim: true },
  backgroundImage: { type: String, trim: true },
  backgroundOverlayContent: { type: String, trim: true },
  status: { 
    type: String, 
    enum: ['draft', 'published'], 
    default: 'draft' 
  },
}, { timestamps: true });

export default mongoose.model('Page', pageSchema);