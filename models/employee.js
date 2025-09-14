
// import mongoose from "mongoose";

// const employeeSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   jobTitle: { type: String },
//   email: { type: String },
//   phone: { type: String },
//   profileImage: { type: String },
//   team: { type: String, enum: ["Jeddah", "Jasmin"], required: true } // 👈 key field
// }, { timestamps: true });

// export default mongoose.model("Team", teamSchema);


// models/employee.model.js
import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  jobTitle: { type: String },
  email: { type: String },
  phone: { type: String },
  profileImage: { type: String }, // store uploaded image path
  team: { type: String, enum: ["Jeddah", "Jasmin", "Regional Team"], required: true }
}, { timestamps: true });

export default mongoose.model("Employee", employeeSchema);


