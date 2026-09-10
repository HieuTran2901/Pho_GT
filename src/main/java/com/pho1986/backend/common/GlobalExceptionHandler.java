package com.pho1986.backend.common;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        String firstError = "Dữ liệu gửi lên không hợp lệ";
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
            firstError = error.getDefaultMessage();
        }
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(ApiResponse.error(firstError, errors));
    }

    @ExceptionHandler(AccountLockedException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleAccountLocked(AccountLockedException ex, HttpServletRequest request) {
        Map<String, Object> lockData = new HashMap<>();
        lockData.put("locked", true);
        lockData.put("permanent", true);
        lockData.put("phone", ex.getPhone());
        lockData.put("lockedAt", ex.getLockedAt() != null ? ex.getLockedAt().toString() : null);
        lockData.put("lockReason", ex.getLockReason());

        // [SENTINEL & BLADE] Thu hồi và xóa sạch HttpOnly Cookie khỏi trình duyệt để chấm dứt phiên ngay lập tức
        boolean isSecure = request != null && request.isSecure();
        ResponseCookie deleteAccess = ResponseCookie.from("accessToken", "")
                .httpOnly(true).secure(isSecure).path("/").maxAge(0).sameSite("Lax").build();
        ResponseCookie deleteRefresh = ResponseCookie.from("refreshToken", "")
                .httpOnly(true).secure(isSecure).path("/api/v1/auth").maxAge(0).sameSite("Lax").build();

        return ResponseEntity.status(HttpStatus.LOCKED)
                .header(HttpHeaders.SET_COOKIE, deleteAccess.toString())
                .header(HttpHeaders.SET_COOKIE, deleteRefresh.toString())
                .body(new ApiResponse<>(false, ex.getMessage(), lockData, null));
    }

    @ExceptionHandler(LoginRateLimitExceededException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleLoginRateLimitExceeded(LoginRateLimitExceededException ex) {
        Map<String, Object> lockData = new HashMap<>();
        lockData.put("locked", true);
        lockData.put("permanent", false);
        lockData.put("retryAfterSeconds", ex.getRetryAfterSeconds());
        lockData.put("round", ex.getCurrentRound());
        lockData.put("maxRounds", ex.getMaxRounds());
        lockData.put("failedAttemptsInRound", ex.getFailedAttemptsInRound());

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header("Retry-After", String.valueOf(ex.getRetryAfterSeconds()))
                .body(new ApiResponse<>(false, ex.getMessage(), lockData, null));
    }

    @ExceptionHandler(PaymentGatewayMaintenanceException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handlePaymentGatewayMaintenance(PaymentGatewayMaintenanceException ex) {
        Map<String, Object> details = new HashMap<>();
        details.put("gatewayId", ex.getGatewayId());
        details.put("maintenance", true);
        details.put("maintenanceMessage", ex.getMaintenanceMessage());

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ApiResponse<>(false, ex.getMessage(), details, null));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleBadCredentials(BadCredentialsException ex) {
        String msg = (ex.getMessage() != null && !ex.getMessage().isBlank() && !"Bad credentials".equals(ex.getMessage()))
                ? ex.getMessage()
                : "Số điện thoại hoặc mật khẩu không chính xác";
        Map<String, Object> data = new HashMap<>();
        if (msg.contains("Vòng ")) {
            try {
                java.util.regex.Matcher m = java.util.regex.Pattern.compile("Vòng (\\d+)/(\\d+)").matcher(msg);
                if (m.find()) {
                    data.put("round", Integer.parseInt(m.group(1)));
                    data.put("maxRounds", Integer.parseInt(m.group(2)));
                }
            } catch (Exception ignored) {}
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse<>(false, msg, data.isEmpty() ? null : data, null));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Bạn không có quyền truy cập chức năng này"));
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<ApiResponse<Void>> handleSecurityException(SecurityException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalStateException(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
    public ResponseEntity<ApiResponse<Void>> handleResponseStatusException(org.springframework.web.server.ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode())
                .body(ApiResponse.error(ex.getReason() != null ? ex.getReason() : ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneralException(Exception ex) {
        log.error("Unhandled exception caught by GlobalExceptionHandler: ", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Đã xảy ra lỗi hệ thống: " + ex.getMessage()));
    }
}
