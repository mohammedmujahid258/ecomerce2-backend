import express from "express"
import {protect} from "../middleware/auth.middleware.js"
import { isAdmin } from "../middleware/admin.middleware.js";
import { registerUser,loginUser,getProfile, getallUsers } from "../controllers/user.controller.js";
const router=express.Router();
router.post("/register",registerUser)
router.post("/login",loginUser)
router.get("/profile",protect,getProfile)
router.get("/all",protect,isAdmin,getallUsers)
export default router
