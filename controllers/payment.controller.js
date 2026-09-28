import Payment from "../models/payment.model.js";
import Order from "../models/order.model.js";

// Create a payment
export const createpayment = async (req, res) => {
    try {
        const { orderId, paymentMethod } = req.body;

        // 1. Validate required fields
        if (!orderId || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Order ID and payment method are required"
            });
        }

        // 2. Validate payment method
        if (!["COD", "MOCK"].includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Payment method must be COD or MOCK"
            });
        }

        // 3. Find the order
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order is not found"
            });
        }

        // 4. Check order ownership
        if (order.user.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "You can pay only for your own order"
            });
        }

        // 5. Check for an existing pending or paid payment
        const existingpayment = await Payment.findOne({
            order: order._id,
            paymentStatus: { $in: ["pending", "paid"] }
        });

        if (existingpayment) {
            return res.status(400).json({
                success: false,
                message: "A payment already exists for this order"
            });
        }

        // 6. Create the payment
        const payment = await Payment.create({
            order: order._id,
            user: req.user.userId,
            amount: order.totalAmount,
            paymentMethod
        });

        // 7. Send the response
        res.status(201).json({
            success: true,
            message: "Payment created successfully",
            payment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating payment",
            error: error.message
        });
    }
};
export const mockpaymentSuccess=async(req,res)=>{
    try{
        const payment=await Payment.findById(req.params.paymentId);
        if(!payment){
            return res.status(404).json({
                success:false,
                message:"Payment not found"
            })
        }
        if(payment.user.toString()!==req.user.userId){
            return res.status(403).json({
                success:false,
                message:"you can update only your own payment"
            })
        }
        if(payment.paymentStatus!=="pending"){
            return res.status(400).json({
                success:false,
                message:"Payment is already completed or cannot be processed"
            })
        }
        payment.paymentStatus="paid";

        await payment.save();

        // A successful payment makes the order ready for fulfillment.
        // `Order.status` is an order-lifecycle status, so use `confirmed`
        // instead of `paid` (which is not an allowed Order status).
     const order = await Order.findByIdAndUpdate(
    payment.order,
    { status: "confirmed" },
    { new: true, runValidators: true }
);

if (!order) {
    return res.status(404).json({
        success: false,
        message: "Order not found"
    });
}

        return res.status(200).json({
            success:true,
            message:"Mock payment successful",
            payment
        })

    } catch(error){
        console.log("Mock payment failed :",error);

        return res.status(500).json({
            success:false,
            message:"Error processing mock payment"
        })
    }
}


// Update payment status
export const updatepaymentStatus = async (req, res) => {
    try {
        const { paymentStatus } = req.body;

        // 1. Validate payment status
        if (!["pending", "paid", "failed", "refunded"].includes(paymentStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment status"
            });
        }

        // 2. Find and update the payment
        const payment = await Payment.findByIdAndUpdate(
            req.params.paymentId,
            { paymentStatus },
            { new: true, runValidators: true }
        );

        // 3. Check whether payment exists
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        // 4. Send the response
        res.status(200).json({
            success: true,
            message: "Payment status updated successfully",
            payment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating payment status",
            error: error.message
        });
    }
};
