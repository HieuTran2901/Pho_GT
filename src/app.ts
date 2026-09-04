import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import authRoutes from "./modules/auth/auth.routes";
import tasteProfileRoutes from "./modules/taste-profile/taste-profile.routes";
import ordersRoutes from "./modules/orders/orders.routes";
import loyaltyRoutes from "./modules/loyalty/loyalty.routes";
import dishesRoutes from "./modules/dishes/dishes.routes";
import addressesRoutes from "./modules/addresses/addresses.routes";

import { errorHandler } from "./middlewares/error.middleware";
import { ENV } from "./config/env";

export const createApp = () => {
  const app = express();

  // 1. Bảo mật và Headers
  app.use(helmet());

  // 2. CORS cho phép kết nối từ Frontend
  app.use(
    cors({
      origin: [ENV.CLIENT_ORIGIN, "http://localhost:5173", "http://localhost:3000"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // 3. Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // 4. Health check
  app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "pho-viet-backend", timestamp: new Date().toISOString() });
  });

  // 5. REST API v1 routes
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/user/taste-profile", tasteProfileRoutes);
  app.use("/api/v1/user/addresses", addressesRoutes);
  app.use("/api/v1/orders", ordersRoutes);
  app.use("/api/v1/loyalty", loyaltyRoutes);
  app.use("/api/v1/dishes", dishesRoutes);

  // 6. Global error handler
  app.use(errorHandler);

  return app;
};
