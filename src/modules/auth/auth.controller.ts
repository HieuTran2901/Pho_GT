import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../prisma";
import { generateAccessToken, generateRefreshToken } from "../../utils/tokens";
import { sendSuccess, sendError } from "../../utils/response";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";

const RegisterSchema = z.object({
  phone: z.string().min(9, "Số điện thoại không hợp lệ"),
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
});

const LoginSchema = z.object({
  phone: z.string().min(9, "Số điện thoại không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

const PostOrderClaimSchema = z.object({
  orderCode: z.string().min(3, "Mã đơn hàng không hợp lệ"),
  phone: z.string().min(9, "Số điện thoại không hợp lệ"),
  fullName: z.string().min(2, "Họ tên không được để trống"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = RegisterSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, parseResult.error.errors[0].message, 422, parseResult.error.errors);
    }

    const { phone, fullName, password, email } = parseResult.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ phone }, ...(email ? [{ email }] : [])],
      },
    });

    if (existingUser) {
      return sendError(res, "Số điện thoại hoặc email đã được đăng ký", 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          phone,
          fullName,
          passwordHash,
          email: email || null,
        },
      });

      // Khởi tạo Gu Ăn Phở mặc định
      await tx.tasteProfile.create({
        data: {
          userId: user.id,
          brothType: "DAM_DA",
          onionStyle: "NHIEU_HANH",
          herbStyle: "DU_RAU",
          spicyLevel: 1,
          crullerPref: "QUAY_GION",
          customNote: "Chuẩn vị truyền thống 1986",
        },
      });

      // Khởi tạo Bát Phở Tri Kỷ với 50 điểm chào mừng
      const loyalty = await tx.loyaltyAccount.create({
        data: {
          userId: user.id,
          totalPoints: 50,
          availablePoints: 50,
          membershipTier: "DONG",
        },
      });

      await tx.loyaltyTransaction.create({
        data: {
          loyaltyAccountId: loyalty.id,
          pointsChange: 50,
          type: "WELCOME_BONUS",
          balanceAfter: 50,
          description: "Điểm chào mừng thành viên mới Phở Gia Truyền 1986",
        },
      });

      return user;
    });

    const accessToken = generateAccessToken({ userId: newUser.id, role: newUser.role });
    const refreshToken = generateRefreshToken({ userId: newUser.id, role: newUser.role });
    setAuthCookies(res, accessToken, refreshToken);

    const fullProfile = await prisma.user.findUnique({
      where: { id: newUser.id },
      select: {
        id: true,
        phone: true,
        email: true,
        fullName: true,
        role: true,
        tasteProfile: true,
        loyaltyAccount: true,
      },
    });

    return sendSuccess(res, { user: fullProfile, accessToken }, "Đăng ký thành viên thành công! Bạn nhận được 50 điểm Tri Kỷ.", 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = LoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, parseResult.error.errors[0].message, 422);
    }

    const { phone, password } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { phone },
      include: {
        tasteProfile: true,
        loyaltyAccount: true,
        addresses: { where: { isDefault: true } },
      },
    });

    if (!user) {
      return sendError(res, "Số điện thoại hoặc mật khẩu không chính xác", 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, "Số điện thoại hoặc mật khẩu không chính xác", 401);
    }

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });
    setAuthCookies(res, accessToken, refreshToken);

    const { passwordHash, ...userWithoutPassword } = user;

    return sendSuccess(res, { user: userWithoutPassword, accessToken }, "Đăng nhập thành công! Chào mừng quý khách trở lại.");
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, "Chưa xác thực", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        tasteProfile: true,
        loyaltyAccount: true,
        addresses: true,
      },
    });

    if (!user) {
      return sendError(res, "Người dùng không tồn tại", 404);
    }

    const { passwordHash, ...userProfile } = user;
    return sendSuccess(res, userProfile);
  } catch (error) {
    next(error);
  }
};

export const postOrderClaim = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = PostOrderClaimSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, parseResult.error.errors[0].message, 422);
    }

    const { orderCode, phone, fullName, password } = parseResult.data;

    const order = await prisma.order.findUnique({
      where: { orderCode },
      include: { items: true },
    });

    if (!order) {
      return sendError(res, "Không tìm thấy thông tin đơn hàng này", 404);
    }

    if (order.userId) {
      return sendError(res, "Đơn hàng này đã được gắn với tài khoản thành viên", 400);
    }

    // Tỉ lệ tích điểm: 1.000đ = 1 điểm (ví dụ: 120.000đ = 120 điểm)
    const earnedPoints = Math.max(10, Math.floor(order.finalAmount / 1000));

    const existingUser = await prisma.user.findUnique({
      where: { phone },
      include: { loyaltyAccount: true },
    });

    let targetUserId = existingUser?.id;
    let targetUserRole = existingUser?.role || "CUSTOMER";

    if (!existingUser) {
      const passwordHash = await bcrypt.hash(password, 10);
      const created = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: { phone, fullName, passwordHash },
        });

        // Tạo taste profile mặc định từ món đầu tiên trong order nếu có
        let brothType = "DAM_DA";
        let onionStyle = "NHIEU_HANH";
        let herbStyle = "DU_RAU";
        let spicyLevel = 1;
        let crullerPref = "QUAY_GION";

        if (order.items.length > 0 && order.items[0].customizedOptions) {
          try {
            const parsed = JSON.parse(order.items[0].customizedOptions);
            if (parsed.brothType) brothType = parsed.brothType;
            if (parsed.onionStyle) onionStyle = parsed.onionStyle;
            if (parsed.herbStyle) herbStyle = parsed.herbStyle;
            if (parsed.spicyLevel !== undefined) spicyLevel = parsed.spicyLevel;
            if (parsed.crullerPref) crullerPref = parsed.crullerPref;
          } catch {}
        }

        await tx.tasteProfile.create({
          data: {
            userId: newUser.id,
            favoriteDishId: order.items[0]?.dishId || null,
            brothType,
            onionStyle,
            herbStyle,
            spicyLevel,
            crullerPref,
            customNote: "Lưu tự động từ đơn đặt món đầu tiên",
          },
        });

        const totalStartPoints = 50 + earnedPoints;
        const loyalty = await tx.loyaltyAccount.create({
          data: {
            userId: newUser.id,
            totalPoints: totalStartPoints,
            availablePoints: totalStartPoints,
            membershipTier: totalStartPoints >= 500 ? "BAC" : "DONG",
            totalSpent: order.finalAmount,
            totalOrdersCount: 1,
          },
        });

        await tx.loyaltyTransaction.create({
          data: {
            loyaltyAccountId: loyalty.id,
            pointsChange: 50,
            type: "WELCOME_BONUS",
            balanceAfter: 50,
            description: "Thưởng 50 điểm chào mừng thành viên mới",
          },
        });

        await tx.loyaltyTransaction.create({
          data: {
            loyaltyAccountId: loyalty.id,
            orderId: order.id,
            pointsChange: earnedPoints,
            type: "EARN_ORDER",
            balanceAfter: totalStartPoints,
            description: `Tích điểm từ đơn hàng #${order.orderCode}`,
          },
        });

        // Cập nhật order gán vào user
        await tx.order.update({
          where: { id: order.id },
          data: { userId: newUser.id },
        });

        return { id: newUser.id, role: newUser.role };
      });

      targetUserId = created.id;
      targetUserRole = created.role;
    } else {
      // User đã có tài khoản
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { userId: existingUser.id },
        });

        const loyalty = await tx.loyaltyAccount.findUnique({
          where: { userId: existingUser.id },
        });

        if (loyalty) {
          const newTotal = loyalty.totalPoints + earnedPoints;
          const newAvail = loyalty.availablePoints + earnedPoints;
          const newSpent = loyalty.totalSpent + order.finalAmount;
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
              description: `Tích điểm từ đơn hàng #${order.orderCode}`,
            },
          });
        }
      });
    }

    const finalUserId = targetUserId!;
    const accessToken = generateAccessToken({ userId: finalUserId, role: targetUserRole });
    const refreshToken = generateRefreshToken({ userId: finalUserId, role: targetUserRole });
    setAuthCookies(res, accessToken, refreshToken);

    return sendSuccess(
      res,
      { orderCode: order.orderCode, pointsEarned: earnedPoints, accessToken },
      `Đã chuyển đổi thành công đơn #${order.orderCode} vào tài khoản! Bạn nhận được ${earnedPoints} điểm.`
    );
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("refreshToken");
  return sendSuccess(res, null, "Đăng xuất thành công. Hẹn sớm gặp lại quý khách!");
};
