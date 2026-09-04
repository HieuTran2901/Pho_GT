import { Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../../prisma";
import { sendSuccess, sendError } from "../../utils/response";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";

export const getLoyaltySummary = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return sendError(res, "Chưa xác thực", 401);

    let loyalty = await prisma.loyaltyAccount.findUnique({
      where: { userId: req.user.userId },
    });

    if (!loyalty) {
      loyalty = await prisma.loyaltyAccount.create({
        data: {
          userId: req.user.userId,
          totalPoints: 50,
          availablePoints: 50,
        },
      });
    }

    // Tính toán tiến độ thăng hạng
    const tierThresholds = {
      DONG: { nextTier: "BAC", target: 500 },
      BAC: { nextTier: "VANG", target: 1000 },
      VANG: { nextTier: "KIM_CUONG", target: 2000 },
      KIM_CUONG: { nextTier: null, target: 2000 },
    };

    const currentTier = loyalty.membershipTier as keyof typeof tierThresholds;
    const tierConfig = tierThresholds[currentTier] || tierThresholds.DONG;

    const pointsToNext = tierConfig.target > loyalty.totalPoints ? tierConfig.target - loyalty.totalPoints : 0;
    const progressPercent = Math.min(100, Math.round((loyalty.totalPoints / tierConfig.target) * 100));

    return sendSuccess(res, {
      account: loyalty,
      tierDetails: {
        currentTier,
        nextTier: tierConfig.nextTier,
        targetPoints: tierConfig.target,
        pointsToNext,
        progressPercent,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLoyaltyLedger = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return sendError(res, "Chưa xác thực", 401);

    const loyalty = await prisma.loyaltyAccount.findUnique({
      where: { userId: req.user.userId },
    });

    if (!loyalty) {
      return sendSuccess(res, []);
    }

    const transactions = await prisma.loyaltyTransaction.findMany({
      where: { loyaltyAccountId: loyalty.id },
      orderBy: { createdAt: "desc" },
    });

    return sendSuccess(res, transactions);
  } catch (error) {
    next(error);
  }
};

export const getAvailableRewards = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const rewards = await prisma.loyaltyReward.findMany({
      where: { isActive: true },
      orderBy: { pointsRequired: "asc" },
    });

    return sendSuccess(res, rewards);
  } catch (error) {
    next(error);
  }
};

const RedeemSchema = z.object({
  rewardId: z.string().min(1, "Vui lòng chọn quà tặng cần đổi"),
});

export const redeemReward = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return sendError(res, "Chưa xác thực", 401);

    const parseResult = RedeemSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, parseResult.error.errors[0].message, 422);
    }

    const { rewardId } = parseResult.data;

    const reward = await prisma.loyaltyReward.findUnique({
      where: { id: rewardId },
    });

    if (!reward || !reward.isActive) {
      return sendError(res, "Phần thưởng không tồn tại hoặc đã hết hạn", 404);
    }

    const loyalty = await prisma.loyaltyAccount.findUnique({
      where: { userId: req.user.userId },
    });

    if (!loyalty || loyalty.availablePoints < reward.pointsRequired) {
      return sendError(res, "Bạn không đủ điểm Tri Kỷ để đổi phần thưởng này", 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const newAvail = loyalty.availablePoints - reward.pointsRequired;
      const account = await tx.loyaltyAccount.update({
        where: { id: loyalty.id },
        data: { availablePoints: newAvail },
      });

      await tx.loyaltyTransaction.create({
        data: {
          loyaltyAccountId: loyalty.id,
          pointsChange: -reward.pointsRequired,
          type: "REDEEM_REWARD",
          balanceAfter: newAvail,
          description: `Đổi quà: ${reward.title}`,
        },
      });

      return account;
    });

    return sendSuccess(
      res,
      { remainingPoints: updated.availablePoints, reward },
      `Đổi thành công: ${reward.title}! Phần thưởng sẽ tự động áp dụng vào bát phở tiếp theo của bạn.`
    );
  } catch (error) {
    next(error);
  }
};
