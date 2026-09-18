import Wishlist from "../models/wishlist.model.js";
import Product from "../models/product.model.js";
import mongoose from "mongoose";


export const addToWishlist=async(req,res)=>{
    try{
        const{productId}=req.body;

        if(!productId){
            return res.status(400).json({
                success:false,
                message:"product Id is rerquired"
            })
        }

        if(!mongoose.isValidObjectId(productId)){
            return res.status(400).json({
                success:false,
                message:"invalid productId"
            })
        }
         const product =await Product.findById(productId);

         if(!product){
            return res.status(404).json({
                success:false,
                message:"Product not found"
            })
         }
         let wishlist = await Wishlist.findOne({ user: req.user.userId });

         if (!wishlist) {
            wishlist = await Wishlist.create({
                user: req.user.userId,
                products: [productId]
            });
         } else if (!wishlist.products.some((id) => id.toString() === productId)) {
            wishlist.products.push(productId);
            await wishlist.save();
         }

         return res.status(200).json({
            success: true,
            message: "Product added to wishlist",
            wishlist
         });
      }
      catch(error){
        console.log("failed to add to wishlist",error)
        return res.status(500).json({
            success: false,
            message: "Unable to add product to wishlist"
        });
      }
     
}
export const getWishlist=async(req,res)=>{

    const wishlist=await Wishlist.findOne({
        user:req.user.userId
    }).populate("products")
    if(!wishlist){
        return res.status(404).json({
            success:false,
            message:"Wishlist not found"

        })
    }
    return res.status(200).json({
        success:true,
        message:"wishlist retrieved successfully",
        wishlist
    })

}

// REMOVE PRODUCT FROM WISHLIST

export const removeFromWishlist = async (req, res) => {
    try {
        // 1. Get productId from request body
        const { productId } = req.body;

        // 2. Check productId is provided
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        // 3. Validate productId
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid productId"
            });
        }

        // 4. Find the logged-in user's wishlist
        const wishlist = await Wishlist.findOne({
            user: req.user.userId
        });

        // 5. Check wishlist exists
        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: "Wishlist not found"
            });
        }

        // 6. Check whether product exists in wishlist
        const productExists = wishlist.products.some(
            (id) => id.toString() === productId
        );

        if (!productExists) {
            return res.status(404).json({
                success: false,
                message: "Product not found in wishlist"
            });
        }

        // 7. Remove the product
        wishlist.products = wishlist.products.filter(
            (id) => id.toString() !== productId
        );

        // 8. Save the updated wishlist
        await wishlist.save();

        // 9. Send response
        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist",
            wishlist
        });

    } catch (error) {
        console.log("Remove from wishlist failed:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to remove product from wishlist"
        });
    }
};

