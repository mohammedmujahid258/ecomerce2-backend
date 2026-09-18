import express from "express";
import {protect} from "../middleware/auth.middleware.js";
import {addToCart,getCart,updateCart,removeFromCart  } from "../controllers/cart.control.js"
const router=express.Router();
router.post("/",protect,addToCart)
router.get("/",protect,getCart)
router.put("/",protect,updateCart)
router.delete("/",protect,removeFromCart)
export default router; 