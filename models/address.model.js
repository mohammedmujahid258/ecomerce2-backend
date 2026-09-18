import mongoose from "mongoose"
  const addressSchema=new mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
        fullname:{
            type:String,
            required:true
        },
        phone:{
            type:String,
            required:true,    
            },
        street:{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        pincode:{
            type:Number,
            required:true
        },
        isDefault:{
            type:Boolean,
            required:false

        }
    }


  ,{timestamps:true})
  const Address=mongoose.model("Address",addressSchema)
  export default Address
