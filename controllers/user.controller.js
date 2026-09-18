import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Product from "../models/product.model.js"
import { uploadToCloudinary } from "../utils/uploadtocloudinary.js";


export const registerUser = async (req, res) => {
    const {name,email,password}=req.body;

    if(!name ||  !email || !password){

        return res.status(400).json({
            success:false,
            message:"Name ,email and password are required "
        });
    }
    const existingUser=await User.findOne({email})
    if(existingUser){
        return res.status(400).json({
            success:false,
            message:"User with this email is already exist"
        })
    }
    const hashedPassword=await bcrypt.hash(password,10)
   const user=await User.create({
    name,
    email,
    password:hashedPassword
   });
   res.status(201).json({
    success:true,
    message:"User register successfully",
    
   })

}


export const loginUser = async (req, res) => {
    const {email,password}=req.body;

    if(!email || !password){
        return res.status(400).json({
            success:false,
            message:"Email and password are required"
        })
    }
    const user=await User.findOne({email})
        if(!user){
            return res.status(401).json({
                success:false,
                
                message:"Invlid email or password"
            })
        }
        const isPasswordiscorrect=await bcrypt.compare(password,user.password)
           if(!isPasswordiscorrect){
            return res.status(401).json({
                success:false,
                message:"invalid email or password"
            })
           }
           const token=jwt.sign(
            {
               userId:user._id,
               role:user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"7d"
            }
           )
           res.json({
            success:true,
            message:"logged successfully",
            token

           })
}
export const getProfile=async(req,res)=>{
    const user=await User.findById(req.user.userId).select("-password");
    res.json({
        success:true,
        message:"profile route works",
        user
    })
}

export const createProduct=async(req,res)=>{
    const {name,description,price,stock,category}=req.body;
    if(!name || !description || price===undefined || stock===undefined || !category){
        return res.status(400).json({
            success:false,
            message:"All product field are required"
        })
    }
    if(!req.file){
        return res.status(400).json({
            success:false,
            message:"Product image is required"
        })
    }
    const cloudinaryResult=await uploadToCloudinary(
        req.file.buffer
    )

    const product=await Product.create({
        name,
        description,
        price,
        stock,
        category,
        image:cloudinaryResult.secure_url

    });
    res.status(201).json({
        success:true,
        message:"product created successfully",
        product
    })

}
export const getProducts=async(req,res)=>{
    const products=await Product.find();
    res.status(200).json({
        success:true,
        products
    })
}

export const getProductById=async(req,res)=>{
    const product=await Product.findById(req.params.id);
    if(!product){
        return res.status(404).json({
            success:false,
            message:"product not found"
        })
    }
    res.status(200).json({
        success:true,
        product
    })
}
export const updateProduct=async(req,res)=>{
    const product=await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new:true, runValidators:true}
    );
    if(!product){
        return res.status(404).json({
            success:false,
            message:"Prodct not found"
        })
    }

    res.status(200).json({
        success:true,
        message:"product update successfully",
        product
    })
}
export const deleteProduct=async(req,res)=>{
        const product=await Product.findByIdAndDelete(req.params.id);
        if(!product){
            return res.status(404).json({
                success:false,
                message:"product not found"
            })
        }
        res.status(200).json({
            success:true,
            message:"product is deleted successfully "
        })
    }
