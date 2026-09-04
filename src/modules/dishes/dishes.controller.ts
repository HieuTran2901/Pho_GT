import { Request, Response, NextFunction } from "express";
import { prisma } from "../../prisma";
import { sendSuccess, sendError } from "../../utils/response";

export const getAllDishes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = req.query;

    const dishes = await prisma.dish.findMany({
      where: {
        isAvailable: true,
        ...(category ? { category: { slug: String(category) } } : {}),
      },
      include: {
        category: true,
      },
      orderBy: [{ isSignature: "desc" }, { price: "asc" }],
    });

    return sendSuccess(res, dishes);
  } catch (error) {
    next(error);
  }
};

export const getDishBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = String(req.params.slug);
    const dish = await prisma.dish.findUnique({
      where: { slug },
      include: { category: true },
    });

    if (!dish) {
      return sendError(res, "Không tìm thấy món ăn này", 404);
    }

    return sendSuccess(res, dish);
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        _count: {
          select: { dishes: true },
        },
      },
    });

    return sendSuccess(res, categories);
  } catch (error) {
    next(error);
  }
};
