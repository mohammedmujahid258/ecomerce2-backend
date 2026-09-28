import Cart from  "../models/cart.model.js"
import Product from "../models/product.model.js"
import mongoose from "mongoose";
export const addToCart=async(req,res)=>{
    try {
    const {productId,quantity}=req.body;
if(!mongoose.isValidObjectId(productId)){
    return res.status(400).json({
        success:false,
        message:"invalid product id"
    });
}

if(!productId){
    return res.status(400).json({
        success:false,
        message:"Product Id is required"
    });
}
    if(typeof quantity !== "number" || quantity <1){
        return res.status(400).json({
            success:false,
            message:"Quantity must be a positive number"
        })
    }
    const product=await Product.findById(productId)
    if (!product){
        return res.status(404).json({
            message:"Product  not found"

        })
    }
    // checking the stock 
    if(quantity>product.stock){
        return res.status(400).json({
            success:false,
            message:"Insufficient stock available"
        })
    }
    // Find user`s cart
    let cart=await Cart.findOne({user:req.user.userId})
    // Create cart if it doesnot exist 
    if(!cart){
        cart=await Cart.create({
            user:req.user.userId,
            items:[{
                product:productId,
                quantity,
            }]
        })
        return res.status(201).json({
            success:true,
            message:"Product added to cart",
            cart
        })
    }

    const existingItem=cart.items.find(
        (item)=>item.product.toString()===productId
    );


    if(existingItem){
        if(existingItem.quantity+quantity>product.stock){
            return res.status(400).json({
                success:false,
                message:"Insufficient stock available "
            });
        }
        existingItem.quantity+=quantity
    }
    else{
        cart.items.push({
            product:productId,
            quantity
        })
    }
    await cart.save();
    res.status(200).json({
        success:true,
        message:"product added to cart",
        cart
    })
    } catch (error) {
        console.error("Add to cart failed:", error.message)
        res.status(500).json({
            success:false,
            message:"Unable to add product to cart"
        })
    }
}

export const getCart=async(req,res)=>{
    try{
        const cart=await Cart.findOne({
            user:req.user.userId
        }).populate("items.product");
        if(!cart){
            return res.status(404).json({
                success:false,
                message:"Cart is not found"
            })
        }
        res.status(200).json({
            success:true,
            message:"Cart retrieved successfully",
            cart

        })
    }
    catch(error){
        console.log("Get cart failed :",error.message)

        res.status(500).json({
            success:false,
            message:"Unable to get the Cart"
        })
    }
}

export const updateCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
            if(!mongoose.isValidObjectId(productId)){
        return res.status(400).json({
            success:false,
            message:"invalid product id"
,
        })

    }

        if(typeof quantity !=="number"|| quantity<1){
            return res.status(400).json({
                success:false,
            message:"Quantity must be a positive number"            })
        }

        const cart = await Cart.findOne({
            user: req.user.userId
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const item = cart.items.find(
            (item) => item.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock available"
            });
        }

        item.quantity = quantity;

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Cart is updated successfully",
            cart
        });

    } catch (error) {
        console.log("Updated cart failed:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to update the cart"
        });
    }
};
export const removeFromCart=async(req,res)=>{
    try{
        const {productId}=req.body;
        if (!productId) {
           return res.status(400).json({
            success: false,
            message: "Product ID is required"
          });
         }

       if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
            success: false,
            message: "Invalid product ID"
      });
}
        const cart=await Cart.findOne({
            user:req.user.userId

        })
        if(!cart){
            return res.status(404).json({
                success:false,
                message:"Cart not found"

            })
        }
        const item=cart.items.find(
            (item)=>item.product.toString()===productId
        )
        if(!item){
            return res.status(404).json({
                success:false,
                message:"Product not found in the cart"
            })
        }
         cart.items = cart.items.filter(
         (item) => item.product.toString() !== productId
);
        await cart.save()
        res.status(200).json({
            success:true,
            message:"Product removed from the cart",
            cart
        })
       
    }
    catch(error){
        console.log("Remove from cart failed :",error.message)
        res.status(500).json({
            success:false,
            message:"Unable to remove product from the cart"
        })
    }

}