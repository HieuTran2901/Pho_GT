import { Router } from "express";
import { createOrder, getQuickReorder, getOrderHistory, getOrderByCode } from "./orders.controller";
import { authenticateJwt, optionalAuthenticateJwt } from "../../middlewares/auth.middleware";

const router = Router();

// Đặt hàng hỗ trợ cả Guest & User
router.post("/", optionalAuthenticateJwt, createOrder);

// 1-Click "Gọi lại bát quen"
router.get("/quick-reorder", authenticateJwt, getQuickReorder);

// Lịch sử đơn hàng của User
router.get("/history", authenticateJwt, getOrderHistory);

// Tra cứu theo mã đơn (Guest & User)
router.get("/:orderCode", getOrderByCode);

export default router;
