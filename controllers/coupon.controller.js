import Coupon from "../models/coupons.model.js";


export const createCoupon=async(req,res)=>{
    try{
        const{
            code,
            discountType,
            discountValue,
            expiryDate
    }=req.body;

    if(!code){

        return res.status(400).json({
            
            success:false,
            message:"coupon code is required "
        });
    }
    if(!discountType){
        return res.status(400).json({
            success:false,
            message:"dicount type is required"
        })

    }
    if(!["percentage","fixed"].includes(discountType)){
        return res.status(400).json({
            success:false,  
            message:"Invalid discount type"
        })
    }
    if(discountValue===undefined || discountValue<0){
        return res.status(400).json(
            {
                success:false,
                message:"Invalid discount type"
            }
        )

    }
    if(!expiryDate){
        return res.status(400).json({
            success:false,
            message:"Expiry date is required"
        })
    }
    const existingCoupon=await Coupon.findOne({
        code:code.toUpperCase()
    })
    if(existingCoupon){
        return res.status(400).json({
            success:false,
            message:"Coupon is already exist"
        })
    }
    const coupon=await Coupon.create({
        code,
        discountType,
        discountValue,
        expiryDate
    }

    )
    return res.status(201).json({
        success:true,
        message:"Coupo created successfully",
        coupon
    })
    }
   catch(error){
    console.log("Created coupon failed :",error);
    return res.status(500).json({
        success:false,
        message:"unable to created coupon "
    })
   }
}
export const applyCoupon=async(req,res)=>{
    try{
        const{code,orderAmount}=req.body;
        if(!code){
            return res.status(400).json({
                success:false,
                message:"Coupon code   is required"
            })
        }
        if(orderAmount===undefined|| orderAmount<=0){
            return res.status(400).json({
                success:false,
                message:"invalid order amount"
            })

        }
        const coupon=await Coupon.findOne({
            code:code.toUpperCase()
        });
        if(!coupon){
            return res.status(404).json({
                success:false,
                message:"Coupon is not found"
            })
        }
        if(!coupon.isActive){
            return res.status(404).json({
                success:false,
                message:"coupon is not active"
            })
        }
        if(new Date()> coupon.expiryDate){
            return res.status(400).json({
                success:false,
                message:"coupon has expired"
            });
        }
        let discount =0;
        if(coupon.discountType==="percentage"){
            discount=(orderAmount*coupon.discountValue)/100;
        }
        else{
            discount=coupon.discountValue;
        }
        if(discount>orderAmount){
            discount=orderAmount
        }
        const finalAmount=orderAmount-discount;
        return res.status(200).json({
            success:true,
            message:"Coupon applied successfully",
            discount,
            finalAmount
        })
    }
    catch(error){
        console.log("Apply coupon failed",error);
        return res.status( 500).json({
            success:false,
            message:"Unable to apply coupon"
        })
    }
}
