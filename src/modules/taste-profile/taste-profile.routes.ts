import { Router } from "express";
import { getTasteProfile, updateTasteProfile } from "./taste-profile.controller";
import { authenticateJwt } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authenticateJwt);
router.get("/", getTasteProfile);
router.put("/", updateTasteProfile);

export default router;
