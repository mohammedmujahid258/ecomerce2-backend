import express from "express"
import { createCoupon,applyCoupon } from "../controllers/coupon.controller.js"
import {protect} from "../middleware/auth.middleware.js"
import { isAdmin } from "../middleware/admin.middleware.js"


const router=express.Router()

router.post("/",protect,createCoupon)
router.post("/apply",protect,applyCoupon)


export default router
