import Address from "../models/address.model.js"


export const createAddress= async(req,res)=>{
    const{fullname,phone,street,city,state,pincode}= req.body;

    try{

   
        if(!fullname || !phone || !street || !city || !state || !pincode){
            return res.status(400).json({
                success:false,
                message:"fullname,phone,street,city,state,pincode are required"

            })
        }
        const address=await Address.create({
            user:req.user.userId,
            fullname,
            phone,
            street,
            city,
            state,
            pincode
        })
        return res.status(201).json({
            success:true,
            message:"Address created successfully",
            address
        })
  
    }


         catch(error){
            console.log("create address failed :",error);
            return res.status(500).json({
                success:false,
                message: "Unable to create address"

            })
             
         }
        }

export const getAddresses=async(req,res)=>{

    try{
        const address=await Address.find({
            user:req.user.userId

        })

    
        if(address.length===0){
        return res.status(404).json({
            success:false,
            message:" no address found"

           
        })
       }

        return res.status(200).json({
        success:true,
        message:"retrieved successfully",
        address:address

        })
    }
    catch(error){
        console.log("failed to retrive",error)
        return res.status(500).json({
            success:false,
            message:"Unable to retrive  address "
        })
    }

}
export const updateAddress=async(req,res)=>{

    try{
        const {fullname,phone,street,city,state,pincode}=req.body;
        const address=await Address.findOne({
            _id:req.params.id,
            user:req.user.userId
        })

        if(!address){
            return res.status(400).json({
                success:false,
                message:"not found address"

            })
        }
        address.fullname=fullname;
        address.phone=phone;
        address.street=street;
        address.city=city;
        address.state=state;
        address.pincode=pincode;



        await address.save()

        return res.status(200).json({
            success:true,
            message:"Address updated successfully",
            address
        })

    }

    catch(error){
        console.log("failed to Update address",error)
        return res.status(500).json({
            success:false,
            message:"Unable to update address"
        })
    }

}
export const deleteAddress = async (req, res) => {
    try {
        const address = await Address.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Address deleted successfully"
        });

    } catch (error) {
        console.log("Failed to delete address:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete address"
        });
    }
};
export const setDefaultAddress = async (req, res) => {
    try {
        // Find the selected address
        const address = await Address.findOne({
            _id: req.params.id,
            user: req.user.userId
        });

        // Check whether address exists
        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        // Remove default status from all user's addresses
        await Address.updateMany(
            { user: req.user.userId },
            { isDefault: false }
        );

        // Make selected address default
        address.isDefault = true;

        // Save the change in MongoDB
        await address.save();

        return res.status(200).json({
            success: true,
            message: "Default address updated successfully",
            address
        });

    } catch (error) {
        console.log("Failed to set default address:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to set default address"
        });
    }
};
