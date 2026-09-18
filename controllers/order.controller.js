import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Coupon from "../models/coupons.model.js";
export const createOrder = async (req, res) => {
    try {
        const{couponCode}=req.body;

        const cart = await Cart.findOne({
            user: req.user.userId
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        if (cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }
        const orderItems=[]

        for (const item of cart.items) {
            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            if (item.quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Product ${product.name} is out of stock`
                });
            }
            orderItems.push({
                product:product._id,
                quantity:item.quantity,
                price: product.price

            })
        }

        let totalAmount = 0;

        for (const item of orderItems) {
            totalAmount += item.price * item.quantity;
        }
        let discount =0;
        if(couponCode){
            const coupon=await Coupon.findOne({
                code:couponCode.toUpperCase()
            })
            if(!coupon){
                return res.status(400).json({
                    success:false,
                    message:"Coupon is not found"
                })
            }
            if(!coupon.isActive){
             return res.status(400).json({
                success:false,
                message:"Coupon is not active"
             })
            }
            if(new Date()>coupon.expiryDate){
                return res.status(400).json({
                    success:false,
                    message:"Coupon has expired"

                })
            }
            if(coupon.discountType==="percentage"){
                discount=(totalAmount*coupon.discountValue)/100
            }
            else{
                discount=coupon.discountValue;
            }
            if(discount > totalAmount){
                discount=totalAmount
            }
        }
        const finalAmount=totalAmount-discount;

        const order = await Order.create({
            user: req.user.userId,
            items: orderItems,
            totalAmount:finalAmount
        });

        for (const item of cart.items) {
            await Product.findByIdAndUpdate(
                item.product,
                {
                    $inc: {
                        stock: -item.quantity
                    }
                }
            );
        }

        cart.items = [];
        await cart.save();

        return res.status(201).json({
            success: true,
            message: "Order is created successfully",
            order: order
        });

    } catch (error) {
        console.log("Create order failed:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to create order"
        });
    }
};

    
export const getOrders=async(req,res)=>{
    try{
        const orders=await Order.find({
            user:req.user.userId

        }).populate("items.product");
        res.status(200).json({
            success:true,
            message:"Order retrieved successfully",
            orders


        })
    }
    catch(error){
        console.log("Get my Order failed :",error.message)
        return res.status(500).json({
            success:false,
            message:"Unable to get orders"
        })
    }
}

export const getAllOrders=async(req,res)=>{
    try{
        const orders=await Order.find()
        .populate("user","-password")
        .populate("items.product");
        res.status(200).json({
            success:true,
            message:"All orders retrieved successfully",
            orders
        })
    }
    
        catch(error){
        console.log("Get all orders failed:",error.message)
        res.status(500).json({
            success:false,
            message:"Unable to fer all orders"
        })
    }
}
export const updateOrderStatus=async(req,res)=>{
    try{
        const {status}=req.body;
        const allowedStatuses=[
            "pending",
            "confirmed",
            "shipped",
            "delivered",
            "completed",
            "cancelled"
        ]
        if(!allowedStatuses.includes(status)){
            return res.status(400).json({
                success:false,
                message:"Invalid order status"
            })
        }
        const order =await Order.findById(req.params.id);

        
        if(!order){
            return res.status(404).json({
                success:false,
                message:"Order is not found"
            })

        }
        order.status=status;
        await order.save();
        res.status(200).json({
            success:true,
            message:"Order status updated successfully",
            order
        })
      }
      catch(error){
        console.log("Updated order status failed :",error.message);
         return res.status(500).json({
            success:false,
            message:"Unable to updated status"
        })
      }
}



