import cloudinary from "../config/cloudinary.js"
import {Readable} from "stream";
export const uploadToCloudinary=(buffer)=>{
    return new Promise((resolve,reject)=>{
        const uploadStream=cloudinary.uploader.upload_stream(
            {
                folder:"ecomerce-products"
            },
            (error,result)=>{
                if(error){
                    reject(error)
                }else{
                    resolve(result)
                }
            }
        )
        Readable.from(buffer).pipe(uploadStream)

    })
}
