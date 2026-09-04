import { Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../../prisma";
import { sendSuccess, sendError } from "../../utils/response";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";

const UpdateTasteSchema = z.object({
  favoriteDishId: z.string().nullable().optional(),
  brothType: z.enum(["THANH", "DAM_DA", "BEO_NGAY"]).optional(),
  onionStyle: z.enum(["IT_HANH", "NHIEU_HANH", "HANH_TRAN", "DAU_HANH"]).optional(),
  herbStyle: z.enum(["DU_RAU", "KHONG_RAU_MUI", "KHONG_HANH_TAY"]).optional(),
  spicyLevel: z.number().min(0).max(3).optional(),
  crullerPref: z.enum(["QUAY_GION", "QUAY_MEM", "KHONG_QUAY"]).optional(),
  customNote: z.string().max(250, "Ghi chú không quá 250 ký tự").nullable().optional(),
});

export const getTasteProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return sendError(res, "Chưa xác thực", 401);

    let profile = await prisma.tasteProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!profile) {
      // Tự động khởi tạo nếu chưa có
      profile = await prisma.tasteProfile.create({
        data: {
          userId: req.user.userId,
        },
      });
    }

    // Nếu có favoriteDishId, nạp thêm chi tiết món phở đó
    let favoriteDish = null;
    if (profile.favoriteDishId) {
      favoriteDish = await prisma.dish.findUnique({
        where: { id: profile.favoriteDishId },
      });
    }

    return sendSuccess(res, { ...profile, favoriteDish });
  } catch (error) {
    next(error);
  }
};

export const updateTasteProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return sendError(res, "Chưa xác thực", 401);

    const parseResult = UpdateTasteSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, parseResult.error.errors[0].message, 422);
    }

    const data = parseResult.data;

    const updatedProfile = await prisma.tasteProfile.upsert({
      where: { userId: req.user.userId },
      update: {
        ...(data.favoriteDishId !== undefined && { favoriteDishId: data.favoriteDishId }),
        ...(data.brothType && { brothType: data.brothType }),
        ...(data.onionStyle && { onionStyle: data.onionStyle }),
        ...(data.herbStyle && { herbStyle: data.herbStyle }),
        ...(data.spicyLevel !== undefined && { spicyLevel: data.spicyLevel }),
        ...(data.crullerPref && { crullerPref: data.crullerPref }),
        ...(data.customNote !== undefined && { customNote: data.customNote }),
      },
      create: {
        userId: req.user.userId,
        favoriteDishId: data.favoriteDishId || null,
        brothType: data.brothType || "DAM_DA",
        onionStyle: data.onionStyle || "NHIEU_HANH",
        herbStyle: data.herbStyle || "DU_RAU",
        spicyLevel: data.spicyLevel !== undefined ? data.spicyLevel : 1,
        crullerPref: data.crullerPref || "QUAY_GION",
        customNote: data.customNote || null,
      },
    });

    return sendSuccess(res, updatedProfile, "Đã lưu Gu Ăn Phở thành công! Món phở của bạn sẽ luôn chuẩn vị.");
  } catch (error) {
    next(error);
  }
};
