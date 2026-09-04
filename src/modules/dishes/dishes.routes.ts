import { Router } from "express";
import { getAllDishes, getDishBySlug, getCategories } from "./dishes.controller";

const router = Router();

router.get("/categories", getCategories);
router.get("/", getAllDishes);
router.get("/:slug", getDishBySlug);

export default router;
