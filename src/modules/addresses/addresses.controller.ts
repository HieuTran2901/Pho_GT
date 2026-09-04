import { Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../../prisma";
import { sendSuccess, sendError } from "../../utils/response";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";

const AddressSchema = z.object({
  recipientName: z.string().min(2, "Tên người nhận phải có ít nhất 2 ký tự"),
  phone: z.string().min(9, "Số điện thoại không hợp lệ"),
  addressLine: z.string().min(5, "Địa chỉ chi tiết không hợp lệ"),
  ward: z.string().optional(),
  district: z.string().min(2, "Vui lòng nhập quận/huyện"),
  city: z.string().default("Hà Nội"),
  isDefault: z.boolean().default(false),
});

export const getAddresses = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return sendError(res, "Chưa xác thực", 401);

    const addresses = await prisma.address.findMany({
      where: { userId: req.user.userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return sendSuccess(res, addresses);
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return sendError(res, "Chưa xác thực", 401);

    const parseResult = AddressSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, parseResult.error.errors[0].message, 422);
    }

    const data = parseResult.data;

    // Nếu đặt là mặc định, hủy mặc định các địa chỉ cũ
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.userId },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: req.user.userId,
        ...data,
      },
    });

    return sendSuccess(res, newAddress, "Đã thêm địa chỉ giao hàng thành công", 201);
  } catch (error) {
    next(error);
  }
};

export const setDefaultAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return sendError(res, "Chưa xác thực", 401);
    const id = String(req.params.id);

    await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId: req.user.userId },
        data: { isDefault: false },
      }),
      prisma.address.update({
        where: { id, userId: req.user.userId },
        data: { isDefault: true },
      }),
    ]);

    return sendSuccess(res, null, "Đã đặt làm địa chỉ mặc định.");
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return sendError(res, "Chưa xác thực", 401);
    const id = String(req.params.id);

    await prisma.address.delete({
      where: { id, userId: req.user.userId },
    });

    return sendSuccess(res, null, "Đã xóa địa chỉ thành công.");
  } catch (error) {
    next(error);
  }
};
