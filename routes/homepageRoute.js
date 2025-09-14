import express from "express";
import {
  createHomePage,
  getAllHomePages,
  getHomePageById,
  updateHomePageById,
  deleteHomePageById,
} from "../controllers/homepageController.js";

import upload from "../middlewares/upload.js";

const router = express.Router();

// CREATE
router.post(
  "/home-page",
  upload.fields([{ name: "backgroundImage", maxCount: 4 }]), // up to 4 images
  createHomePage
);

// READ all
router.get("/home-pages", getAllHomePages);

// READ by ID
router.get("/home-page/:id", getHomePageById);

// UPDATE by ID
router.put(
  "/home-page/:id",
  upload.fields([{ name: "backgroundImage", maxCount: 4 }]),
  updateHomePageById
);

// DELETE by ID
router.delete("/home-page/:id", deleteHomePageById);

export default router;
