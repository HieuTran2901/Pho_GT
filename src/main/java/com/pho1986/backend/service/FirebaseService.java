package com.pho1986.backend.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class FirebaseService {

    private static final Logger log = LoggerFactory.getLogger(FirebaseService.class);

    private final FirebaseAuth firebaseAuth;

    public FirebaseService(@Autowired(required = false) FirebaseAuth firebaseAuth) {
        this.firebaseAuth = firebaseAuth;
    }

    /**
     * Xác thực tính hợp lệ của Firebase ID Token do client gửi lên
     */
    public FirebaseToken verifyIdToken(String idToken) throws FirebaseAuthException {
        if (!StringUtils.hasText(idToken)) {
            throw new IllegalArgumentException("Firebase ID Token không được để trống.");
        }

        if (firebaseAuth != null) {
            return firebaseAuth.verifyIdToken(idToken);
        }

        log.warn("[FIREBASE_SERVICE] FirebaseAuth bean chua duoc khoi tao. Kiem tra credentials Firebase.");
        throw new IllegalStateException("Hệ thống xác thực Firebase chưa được cấu hình credentials hợp lệ.");
    }

    /**
     * Trích xuất số điện thoại (E.164) từ FirebaseToken
     */
    public String extractPhoneNumber(FirebaseToken token) {
        if (token == null) return null;
        Object phoneClaim = token.getClaims().get("phone_number");
        if (phoneClaim != null && StringUtils.hasText(phoneClaim.toString())) {
            return phoneClaim.toString().trim();
        }
        return null;
    }

    /**
     * Trích xuất Firebase UID duy nhất từ token
     */
    public String extractUid(FirebaseToken token) {
        return token != null ? token.getUid() : null;
    }

    /**
     * Chuẩn hóa số điện thoại về định dạng nội địa Việt Nam (10 chữ số, bắt đầu bằng 0)
     * Ví dụ: "+84988888888" -> "0988888888", "84988888888" -> "0988888888"
     */
    public String normalizeVietnamPhone(String rawPhone) {
        if (!StringUtils.hasText(rawPhone)) {
            return null;
        }

        String digits = rawPhone.replaceAll("\\D", "");

        if (digits.startsWith("84") && digits.length() == 11) {
            return "0" + digits.substring(2);
        }

        if (digits.startsWith("0") && digits.length() == 10) {
            return digits;
        }

        if (digits.length() == 9) {
            return "0" + digits;
        }

        return digits;
    }

    /**
     * Kiểm tra hệ thống Firebase đã sẵn sàng xử lý hay chưa
     */
    public boolean isFirebaseReady() {
        return this.firebaseAuth != null;
    }
}
