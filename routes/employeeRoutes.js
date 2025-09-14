import express from "express";
import {
  createEmployee,
  getEmployees,
  getEmployeesByTeam,
  updateEmployee,
  deleteEmployee
} from "../controllers/employeeController.js";

import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/", upload.fields([{ name: "profileImage", maxCount: 1 }]), createEmployee);  
router.get("/", getEmployees);            
router.get("/team/:team", getEmployeesByTeam); 
router.put("/:id", upload.fields([{ name: "profileImage", maxCount: 1 }]), updateEmployee);
router.delete("/:id", deleteEmployee);

export default router;
