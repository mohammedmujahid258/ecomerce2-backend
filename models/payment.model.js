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
            enum:["COD","MOCK"],
            required:true
        },
        paymentStatus:{
            type:String,
            enum:["pending","paid","failed","refund"],
            default:"pending"
        }
    },
    {
        timestamps:true
    }
);
const payment=mongoose.model("Payment",paymentSchema)
export default payment