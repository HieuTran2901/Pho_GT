import { Router } from "express";
import {
  getAddresses,
  createAddress,
  setDefaultAddress,
  deleteAddress,
} from "./addresses.controller";
import { authenticateJwt } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authenticateJwt);
router.get("/", getAddresses);
router.post("/", createAddress);
router.put("/:id/default", setDefaultAddress);
router.delete("/:id", deleteAddress);

export default router;
