import Payment from "../models/payment.model.js";
import Order from "../models/order.model.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const getRazorpay = () => new Razorpay({
    key_id: (process.env.RAZORPAY_KEY_ID || "").trim(),
    key_secret: (process.env.RAZORPAY_KEY_SECRET || "").trim(),
});

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
        if (!["COD", "MOCK", "RAZORPAY"].includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Payment method must be COD, MOCK or RAZORPAY"
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
            if (existingpayment.paymentStatus === "paid") {
                return res.status(400).json({
                    success: false,
                    message: "A paid payment already exists for this order"
                });
            }
            // Reuse existing pending payment record
            existingpayment.paymentMethod = paymentMethod;
            await existingpayment.save();
        }

        // 6. Create or reuse payment record
        const payment = existingpayment || await Payment.create({
            order: order._id,
            user: req.user.userId,
            amount: order.totalAmount,
            paymentMethod,
            paymentStatus: "pending",
        });

        if (paymentMethod === "RAZORPAY") {
            const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
            const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

            if (!keyId || !keySecret) {
                return res.status(503).json({
                    success: false,
                    message: "Razorpay online payments are not configured on the server. Please select Cash on Delivery."
                });
            }

            try {
                const razorpayOrder = await getRazorpay().orders.create({
                    amount: Math.round(order.totalAmount * 100),
                    currency: "INR",
                    receipt: order._id.toString(),
                    notes: { orderId: order._id.toString(), paymentId: payment._id.toString() },
                });
                payment.razorpayOrderId = razorpayOrder.id;
                await payment.save();
                return res.status(201).json({
                    success: true,
                    payment,
                    razorpay: {
                        orderId: razorpayOrder.id,
                        amount: razorpayOrder.amount,
                        currency: razorpayOrder.currency,
                        keyId: keyId,
                    },
                });
            } catch (rzpErr) {
                console.error("Razorpay orders.create failed:", rzpErr.message || rzpErr);
                return res.status(400).json({
                    success: false,
                    message: `Razorpay payment gateway error: ${rzpErr.error?.description || rzpErr.message || "Invalid credentials"}. Please select Cash on Delivery.`
                });
            }
        }

        // 7. Send the response for COD / other methods
        return res.status(201).json({
            success: true,
            message: "Payment created successfully",
            payment
        });

    } catch (error) {
        console.error("createpayment error:", error);
        return res.status(500).json({
            success: false,
            message: "Error creating payment",
            error: error.message
        });
    }
};

export const verifyRazorpayPayment = async (req, res) => {
    try {
        const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const payment = await Payment.findOne({ order: orderId, user: req.user.userId, paymentMethod: "RAZORPAY" });
        if (!payment || payment.razorpayOrderId !== razorpay_order_id) {
            return res.status(404).json({ success: false, message: "Payment record not found" });
        }
        const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
        if (!keySecret) {
            return res.status(500).json({ success: false, message: "Payment gateway secret is missing." });
        }
        const expectedSignature = crypto
            .createHmac("sha256", keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");
        if (expectedSignature !== razorpay_signature) {
            payment.paymentStatus = "failed";
            await payment.save();
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }
        payment.paymentStatus = "paid";
        payment.razorpayPaymentId = razorpay_payment_id;
        await payment.save();
        const order = await Order.findOneAndUpdate({ _id: orderId, user: req.user.userId }, { status: "confirmed" }, { new: true, runValidators: true });
        return res.status(200).json({ success: true, message: "Payment verified successfully", payment, order });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Payment verification failed" });
    }
};

export const mockpaymentSuccess = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.paymentId);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }
        if (payment.user.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "you can update only your own payment"
            });
        }
        if (payment.paymentStatus === "paid") {
            return res.status(200).json({
                success: true,
                message: "Payment already confirmed",
                payment
            });
        }
        payment.paymentStatus = "paid";
        await payment.save();

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
            success: true,
            message: "Payment confirmed successfully",
            payment,
            order
        });

    } catch (error) {
        console.log("Payment confirmation failed:", error);
        return res.status(500).json({
            success: false,
            message: "Error processing payment"
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

