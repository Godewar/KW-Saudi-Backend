import mongoose from "mongoose";

const homePageSchema = new mongoose.Schema({
//   pageName: { type: String, required: true, trim: true },
  backgroundImage: [String],   // allow multiple images
//   backgroundOverlayContent: { type: String, trim: true },
  heading:{type:String},
  subheading:{type:String},
  status: {
    type: String,
    enum: ["draft", "published"],
    default: "draft",
  },
}, { timestamps: true });

export default mongoose.model("homepage", homePageSchema);
