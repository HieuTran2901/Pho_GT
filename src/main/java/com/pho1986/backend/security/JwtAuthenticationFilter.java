package com.pho1986.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final TokenRevocationService revocationService;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider, TokenRevocationService revocationService) {
        this.tokenProvider = tokenProvider;
        this.revocationService = revocationService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String token = getJwtFromRequest(request);

        if (StringUtils.hasText(token) && tokenProvider.validateToken(token)) {
            String userId = tokenProvider.getUserIdFromToken(token);

            // [SENTINEL & BLADE] Real-Time Kill Switch: Chặn đứng mọi request tiếp theo của tài khoản bị khóa
            String path = request.getRequestURI();
            boolean isAuthBypass = path != null && (path.endsWith("/login") || path.endsWith("/register") || path.endsWith("/logout"));

            if (!isAuthBypass && revocationService.isUserLocked(userId)) {
                sendAccountLockedResponse(response, userId, request);
                return;
            }

            // [SECURITY_AGENT] Check if token or its JTI has been revoked upon logout
            String jti = tokenProvider.getJtiFromToken(token);
            if (!revocationService.isRevoked(token) && (jti == null || !revocationService.isRevoked(jti))) {
                String role = tokenProvider.getRoleFromToken(token);

                SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userId, null, Collections.singletonList(authority));
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

    private void sendAccountLockedResponse(HttpServletResponse response, String userId, HttpServletRequest request) throws IOException {
        response.setStatus(423); // HttpStatus.LOCKED (RFC 4918)
        response.setContentType("application/json;charset=UTF-8");

        // [SENTINEL & BLADE] Thu hồi và xóa sạch HttpOnly Cookie khỏi trình duyệt để chấm dứt phiên ngay lập tức
        boolean isSecure = request.isSecure();
        ResponseCookie deleteAccess = ResponseCookie.from("accessToken", "")
                .httpOnly(true).secure(isSecure).path("/").maxAge(0).sameSite("Lax").build();
        ResponseCookie deleteRefresh = ResponseCookie.from("refreshToken", "")
                .httpOnly(true).secure(isSecure).path("/api/v1/auth").maxAge(0).sameSite("Lax").build();
        response.addHeader(HttpHeaders.SET_COOKIE, deleteAccess.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, deleteRefresh.toString());

        String reason = revocationService.getLockReason(userId);
        if (reason == null || reason.isBlank()) {
            reason = "Tài khoản của quý khách đã bị khóa bởi Quản trị viên Phở 1986.";
        }

        String safeReason = reason.replace("\"", "\\\"");
        String json = String.format(
                "{\"success\":false,\"code\":\"ACCOUNT_LOCKED\",\"message\":\"Tài khoản của quý khách hiện đang bị tạm dừng hoặc khóa bởi Quản trị viên Phở 1986. Lý do: %s\",\"data\":{\"locked\":true,\"permanent\":true,\"lockReason\":\"%s\"}}",
                safeReason, safeReason
        );
        response.getWriter().write(json);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
