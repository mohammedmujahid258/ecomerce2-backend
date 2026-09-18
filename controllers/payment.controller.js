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