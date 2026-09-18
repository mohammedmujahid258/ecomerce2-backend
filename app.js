import express from "express";

import healthRouter from "./routes/health.routes.js";
import userRouter from "./routes/user.route.js";
import productRouter from "./routes/product.route.js";
import cartRouter from "./routes/cart.route.js";
import orderRouter from "./routes/order.route.js";
import addressRouter from "./routes/address.route.js";
import wishlistRouter from "./routes/wishlist.route.js";
import reviewRouter from "./routes/review.routes.js";
import couponRouter from "./routes/coupon.routes.js";
import paymentRouter from "./routes/payment.route.js";

const app = express();

app.use(express.json());

app.use("/api/v1", healthRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/addresses", addressRouter);
app.use("/api/v1/wishlist", wishlistRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/coupons", couponRouter);
app.use("/api/v1/payments", paymentRouter);

export default app;