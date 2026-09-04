import { Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../../prisma";
import { sendSuccess, sendError } from "../../utils/response";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";

const CreateOrderItemSchema = z.object({
  dishId: z.string().optional(),
  dishName: z.string(),
  unitPrice: z.number().positive(),
  quantity: z.number().int().positive(),
  customizedOptions: z.record(z.any()).optional(), // { brothType, onionStyle, herbStyle, spicyLevel, crullerPref }
});

const CreateOrderSchema = z.object({
  guestName: z.string().optional(),
  guestPhone: z.string().optional(),
  deliveryAddressText: z.string().min(5, "Địa chỉ nhận hàng không được để trống"),
  paymentMethod: z.enum(["COD", "BANK_TRANSFER", "VNPAY", "MOMO"]).default("COD"),
  notes: z.string().optional(),
  items: z.array(CreateOrderItemSchema).min(1, "Đơn hàng phải có ít nhất 1 món"),
});

const generateOrderCode = (): string => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(100 + Math.random() * 900);
  return `PHO-${timestamp}${random}`;
};

export const createOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const parseResult = CreateOrderSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, parseResult.error.errors[0].message, 422, parseResult.error.errors);
    }

    const { guestName, guestPhone, deliveryAddressText, paymentMethod, notes, items } = parseResult.data;
    const userId = req.user ? req.user.userId : null;

    if (!userId && (!guestPhone || !guestName)) {
      return sendError(res, "Quý khách vui lòng cung cấp tên và số điện thoại nhận hàng", 400);
    }

    // Tính tổng tiền
    const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const discountAmount = 0; // Có thể mở rộng voucher
    const finalAmount = totalAmount - discountAmount;
    const orderCode = generateOrderCode();

    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderCode,
          userId,
          guestName: !userId ? guestName : null,
          guestPhone: !userId ? guestPhone : null,
          deliveryAddressText,
          paymentMethod,
          paymentStatus: paymentMethod === "COD" ? "UNPAID" : "PAID",
          totalAmount,
          discountAmount,
          finalAmount,
          notes: notes || null,
          items: {
            create: items.map((item) => ({
              dishId: item.dishId || null,
              dishName: item.dishName,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              subtotal: item.unitPrice * item.quantity,
              customizedOptions: item.customizedOptions ? JSON.stringify(item.customizedOptions) : null,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Nếu người dùng đã đăng nhập, tự động tích điểm Loyalty
      if (userId) {
        const earnedPoints = Math.max(10, Math.floor(finalAmount / 1000));
        const loyalty = await tx.loyaltyAccount.findUnique({ where: { userId } });

        if (loyalty) {
          const newTotal = loyalty.totalPoints + earnedPoints;
          const newAvail = loyalty.availablePoints + earnedPoints;
          const newSpent = loyalty.totalSpent + finalAmount;
          const newTier = newTotal >= 2000 ? "KIM_CUONG" : newTotal >= 1000 ? "VANG" : newTotal >= 500 ? "BAC" : "DONG";

          await tx.loyaltyAccount.update({
            where: { id: loyalty.id },
            data: {
              totalPoints: newTotal,
              availablePoints: newAvail,
              totalSpent: newSpent,
              totalOrdersCount: loyalty.totalOrdersCount + 1,
              membershipTier: newTier,
            },
          });

          await tx.loyaltyTransaction.create({
            data: {
              loyaltyAccountId: loyalty.id,
              orderId: order.id,
              pointsChange: earnedPoints,
              type: "EARN_ORDER",
              balanceAfter: newAvail,
              description: `Tích điểm đơn hàng #${order.orderCode}`,
            },
          });
        }
      }

      return order;
    });

    return sendSuccess(
      res,
      newOrder,
      "Đặt món thành công! Bếp Phở Gia Truyền 1986 đang chuẩn bị bát phở nóng hổi cho bạn.",
      201
    );
  } catch (error) {
    next(error);
  }
};

// Endpoint 1-Click "Gọi lại bát quen"
export const getQuickReorder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return sendError(res, "Chưa xác thực", 401);

    // Lấy đơn hàng gần nhất của user
    const lastOrder = await prisma.order.findFirst({
      where: { userId: req.user.userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    });

    // Lấy Gu Ăn Phở để kết hợp gợi ý hoàn hảo
    const tasteProfile = await prisma.tasteProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!lastOrder) {
      return sendError(res, "Bạn chưa có đơn hàng nào trước đây để gọi lại", 404);
    }

    const reorderPayload = {
      sourceOrderCode: lastOrder.orderCode,
      deliveryAddressText: lastOrder.deliveryAddressText,
      items: lastOrder.items.map((item) => ({
        dishId: item.dishId,
        dishName: item.dishName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        customizedOptions: item.customizedOptions ? JSON.parse(item.customizedOptions) : null,
      })),
      tasteProfile,
    };

    return sendSuccess(res, reorderPayload, "Dữ liệu bát phở quen thuộc sẵn sàng cho bạn đặt lại.");
  } catch (error) {
    next(error);
  }
};

// Lịch sử đơn hàng của User
export const getOrderHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return sendError(res, "Chưa xác thực", 401);

    const orders = await prisma.order.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    });

    return sendSuccess(res, orders);
  } catch (error) {
    next(error);
  }
};

// Tra cứu chi tiết đơn hàng (Dành cho cả Guest & User)
export const getOrderByCode = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orderCode = String(req.params.orderCode);
    const order = await prisma.order.findUnique({
      where: { orderCode },
      include: {
        items: true,
      },
    });

    if (!order) {
      return sendError(res, "Không tìm thấy đơn hàng với mã này", 404);
    }

    return sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
};
