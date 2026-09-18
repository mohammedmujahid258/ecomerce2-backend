import express from "express"
import {protect} from "../middleware/auth.middleware.js"
import { registerUser,loginUser,getProfile,getProducts } from "../controllers/user.controller.js";
const router=express.Router();
router.post("/register",registerUser)
router.post("/login",loginUser)
router.get("/profile",protect,getProfile)
router.get("/all",protect,getProducts)
export default router
