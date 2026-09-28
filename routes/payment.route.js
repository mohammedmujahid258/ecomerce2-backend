import express from "express"
import { protect } from "../middleware/auth.middleware.js"
import {isAdmin} from "../middleware/admin.middleware.js"
import { createpayment, updatepaymentStatus,mockpaymentSuccess } from "../controllers/payment.controller.js"

const router=express.Router()

router.post("/",protect,createpayment)
router.patch("/:paymentId/status",protect,isAdmin,updatepaymentStatus)
router.post(
  "/:paymentId/mock-success",
  protect,
  mockpaymentSuccess
);
export default router;
