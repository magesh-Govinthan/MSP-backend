// routes/reviewRoutes.js
import express from "express";
import {
  createReview,
  getReviews,
  deleteReview,
} from "../controllers/reviewController.js";

const router = express.Router();

// Create review
router.post("/", createReview);

// Get all reviews
router.get("/", getReviews);

// Delete review
router.delete("/:id", deleteReview);

export default router;