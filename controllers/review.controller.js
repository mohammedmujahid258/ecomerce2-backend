import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import mongoose from "mongoose"
export const addReview=async(req,res)=>{
    try{
        const{productId,rating,comment}=req.body;
        if(!productId){
            return res.status(400).json({
                success:false,
                message:"Product Id is required"
            });
        }
        if(!mongoose.isValidObjectId(productId)){
            return res.status(400).json({
                success:false,
                message:"invalid product Id"
            })
        }

        const product=await Product.findById(productId);
        if(!product){
            return res.status(404).json({
                success:false,
                message:"product not found"
            })
        }
        if(!rating || rating<1 || rating>5){
            return res.status(400).json({
                success:false,
                message:"Rating must be between 1 and 5"
            })
        }
        const review=await Review.create({
            user:req.user.userId,
            product:productId,
            rating,
            comment

        })
        return res.status(201).json({
            success:true,
            message:"Review added succcessfully",
            review
        })


    } catch(error){
        console.log("Add  review failed :",error);
        return res.status(500).json({
            success:false,
            message:"Unable to add review"
        })
    }
}
export const getReview =async(req,res)=>{
    try{
        const {productId}=req.params;
        if(!mongoose.isValidObjectId(productId)){
            return res.status(400).json({
                success:false,
                message:"Invalid product Id"
            })
        }
        const review=await Review.find({
            product:productId
        
        }).populate("user","name");
        return res.status(200).json({
            success:true,
            message:"Review retrieved successfully",
            review
        })
    }
    catch(error){
        console.log("Get  review failed :",error)
        return res.status(500).json({

            success:false,
            message:"Unable to get review"
        })
    }
}

export const updateReview=async(req,res)=>{
    try{
        const{reviewId}=req.params;
        const {rating,comment}=req.body;
        if(!mongoose.isValidObjectId(reviewId)){
            return res.status(400).json({
                success:false,
                message:"invalid review Id"
            });
        }
        const review=await Review.findById(reviewId);

        if(!review){
            return res.status(404).json({
                success:false,
                message:"Review not found"
            })
        }

        if(review.user.toString()!=req.user.userId){
            return res.status(400).json({
                success:false,
                message:"you  can update only your own review"
            })
        }
        if(rating === undefined || rating < 1 || rating > 5){
            return res.status(403).json(
{                success:false,
                message:"Rating must be between 1 and 5"
            }
            )
        }
        if(!comment){
        return res.status(400).json({
            success:false,
            message:"Comment is required"
        })
        }
        review.rating=rating;
        review.comment=comment;
        await review.save();
        return res.status(200).json({
            success:true,
            message:"Review updated successfully",
            review
        })
    }
    catch(error){
        console.log("Update review failed : ",error);
        return res.status(500).json({
            success:false,
            message:"Unable to update review"

        })
    }
}



export const deleteReview=async(req,res)=>{


    try{
        const{reviewId}=req.params;

        if(!mongoose.isValidObjectId(reviewId)){
            return res.status(400).json({
                success:false,
                message:"Invalid review ID"
            });
        }

        const review =await Review.findById(reviewId);
        if(!review){
            return res.status(404).json({
                    success:false,
                message:"Review not found"
            })
        }
        if(review.user.toString()!==req.user.userId){
            return res.status(403).json({
                success:false,
                message:"You can delete only your own review "
            })
        }
        await Review.findByIdAndDelete(reviewId);
        return res.status(200).json({
            success:true,
            message:"Review deleted successfully"
        })
    } catch(error){
        console.log("Delete review failed :",error);
        return res.status(500).json({
            success:false,
            message:"Unable to  delete review"
        })
    }
}
