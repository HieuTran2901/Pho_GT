package com.pho1986.backend.common;

/**
 * [SECURITY_AGENT] LoginRateLimitExceededException
 * Ném ra khi người dùng nhập sai quá 5 lần trong một vòng thử,
 * kích hoạt cơ chế tạm khóa lũy tiến (Tiered Cooldown).
 */
public class LoginRateLimitExceededException extends RuntimeException {
    private final long retryAfterSeconds;
    private final int currentRound;
    private final int maxRounds;
    private final int failedAttemptsInRound;

    public LoginRateLimitExceededException(String message, long retryAfterSeconds) {
        this(message, retryAfterSeconds, 1, 5, 5);
    }

    public LoginRateLimitExceededException(
            String message,
            long retryAfterSeconds,
            int currentRound,
            int maxRounds,
            int failedAttemptsInRound) {
        super(message);
        this.retryAfterSeconds = retryAfterSeconds;
        this.currentRound = currentRound;
        this.maxRounds = maxRounds;
        this.failedAttemptsInRound = failedAttemptsInRound;
    }

    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }

    public int getCurrentRound() {
        return currentRound;
    }

    public int getMaxRounds() {
        return maxRounds;
    }

    public int getFailedAttemptsInRound() {
        return failedAttemptsInRound;
    }
}
