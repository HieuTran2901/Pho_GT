import { Router } from "express";
import {
  getLoyaltySummary,
  getLoyaltyLedger,
  getAvailableRewards,
  redeemReward,
} from "./loyalty.controller";
import { authenticateJwt } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/rewards", getAvailableRewards);
router.use(authenticateJwt);
router.get("/summary", getLoyaltySummary);
router.get("/ledger", getLoyaltyLedger);
router.post("/redeem", redeemReward);

export default router;
