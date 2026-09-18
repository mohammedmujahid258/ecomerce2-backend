import express from "express"
import { createAddress,getAddresses, updateAddress,deleteAddress, setDefaultAddress } from "../controllers/address.controller.js"
import { protect } from "../middleware/auth.middleware.js"



const router=express.Router()



router.post("/",protect,createAddress)
router.get("/",protect,getAddresses)
router.put("/:id",protect,updateAddress)
router.delete("/:id",protect,deleteAddress)
router.patch("/:id/default",protect,setDefaultAddress)



export default router