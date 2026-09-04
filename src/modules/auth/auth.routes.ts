import { Router } from "express";
import { register, login, getMe, postOrderClaim, logout } from "./auth.controller";
import { authenticateJwt } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/post-order-claim", postOrderClaim);
router.get("/me", authenticateJwt, getMe);
router.post("/logout", logout);

export default router;
