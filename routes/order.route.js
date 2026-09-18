import express from "express";
import {protect} from "../middleware/auth.middleware.js";
import { createOrder,getAllOrders,getOrders,updateOrderStatus } from "../controllers/order.controller.js";
import {isAdmin} from "../middleware/admin.middleware.js"
const router = express.Router();
router.post("/create", protect,createOrder);
router.get("/",protect,getOrders)
router.get("/all",protect,isAdmin,getAllOrders)
router.patch("/:id/status",protect,isAdmin,updateOrderStatus)
 export default router