import express from "express";
import cors from "cors"

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

const corsOptions = {
    // Reflect the requesting origin. This produces one valid
    // Access-Control-Allow-Origin value for each browser request.
    // Do not use "*" when credentials are enabled.
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    // Let the cors package reflect the browser's requested headers.
    // This avoids rejecting Axios/custom headers during preflight.
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use("/api/v1", healthRouter);
app.use("/api/v1/users", userRouter);
// Keep the auth prefix available for frontend builds that use /auth/login.
app.use("/api/v1/auth", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/addresses", addressRouter);
app.use("/api/v1/wishlist", wishlistRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/coupons", couponRouter);
app.use("/api/v1/payments", paymentRouter);

export default app;
