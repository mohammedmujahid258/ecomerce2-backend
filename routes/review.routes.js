import express from "express";
import {protect} from "../middleware/auth.middleware.js";
import { addReview,getReview,updateReview,deleteReview}from "../controllers/review.controller.js";
const router=express.Router()
router.post("/",protect,addReview)
router.get("/:productId",getReview)
router.put("/:reviewId",protect,updateReview)
router.delete("/:reviewId",protect,deleteReview)

export default router
