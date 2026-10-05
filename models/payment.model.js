import mongoose from "mongoose";
const paymentSchema=new mongoose.Schema(
    {
        order:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Order",
            required:true
        },
        user:{

            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        amount:{
            type:Number,
            required:true
        },
        paymentMethod:{
            type:String,
            enum:["COD","RAZORPAY","MOCK"],
            required:true
        },
        razorpayOrderId:{ type:String, index:true },
        razorpayPaymentId:{ type:String },
        paymentStatus:{
            type:String,
            enum:["pending","paid","failed","refunded"],
            default:"pending"
        }
    },
    {
        timestamps:true
    }
);
const payment=mongoose.model("Payment",paymentSchema)
export default payment
