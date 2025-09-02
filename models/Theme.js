// import mongoose from 'mongoose';

// const themeSchema = new mongoose.Schema({
//   primaryColor: String,
//   secondaryColor: String,
//   backgroundColor: String,
//   textColor: String,
// }, { timestamps: true });

// export default mongoose.model('Theme', themeSchema);

import mongoose from 'mongoose';
import slugify from 'slugify';

const themeSchema = new mongoose.Schema(
  {
    primaryColor: String,
    secondaryColor: String,
    backgroundColor: String,
    textColor: String,
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Generate slug from primaryColor before saving
themeSchema.pre('save', function (next) {
  if (!this.slug && this.primaryColor) {
    this.slug = slugify(this.primaryColor, { lower: true });
  }
  next();
});

export default mongoose.model('Theme', themeSchema);
