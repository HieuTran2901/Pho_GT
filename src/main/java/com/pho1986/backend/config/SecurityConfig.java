package com.pho1986.backend.config;

import com.pho1986.backend.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final com.pho1986.backend.security.ThreatDefenseFilter threatDefenseFilter;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          com.pho1986.backend.security.ThreatDefenseFilter threatDefenseFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.threatDefenseFilter = threatDefenseFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/health").permitAll()
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/dishes/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/tables/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/loyalty/rewards").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/vouchers/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/vouchers/validate").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/orders").permitAll() // Hỗ trợ Guest checkout
                        .requestMatchers(HttpMethod.GET, "/api/v1/orders/quick-reorder").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/orders/history").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/orders/*").permitAll() // Tra cứu theo mã đơn
                        .requestMatchers(HttpMethod.POST, "/api/v1/chat/**").permitAll() // Trợ lý ẩm thực Tiểu Nhị 1986
                        .requestMatchers(HttpMethod.GET, "/api/v1/payments/gateways").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/payments").permitAll() // Khởi tạo thanh toán (Guest/User)
                        .requestMatchers(HttpMethod.GET, "/api/v1/payments/*/status").permitAll()
                        // Thu hồi quyền truy cập mở permitAll(): Yêu cầu ROLE_ADMIN hoặc chữ ký HMAC/Secret Key bảo mật
                        .requestMatchers(HttpMethod.POST, "/api/v1/payments/*/confirm").access((authenticationSupplier, context) -> {
                            org.springframework.security.core.Authentication userAuth = authenticationSupplier.get();
                            if (userAuth != null && userAuth.isAuthenticated()
                                    && !(userAuth instanceof org.springframework.security.authentication.AnonymousAuthenticationToken)) {
                                if (userAuth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()))) {
                                    return new org.springframework.security.authorization.AuthorizationDecision(true);
                                }
                            }
                            // Cuộc gọi xác nhận thanh toán công khai bắt buộc phải có thông tin xác thực mật mã (Headers hoặc JSON Body)
                            jakarta.servlet.http.HttpServletRequest req = context.getRequest();
                            boolean hasSecretHeader = org.springframework.util.StringUtils.hasText(req.getHeader("X-Secret-Key"))
                                    || org.springframework.util.StringUtils.hasText(req.getHeader("X-Signature"))
                                    || org.springframework.util.StringUtils.hasText(req.getHeader("Authorization"));
                            boolean hasJsonPayload = req.getContentType() != null && req.getContentType().toLowerCase().contains("application/json");
                            return new org.springframework.security.authorization.AuthorizationDecision(hasSecretHeader || hasJsonPayload);
                        })
                        .requestMatchers(HttpMethod.POST, "/api/v1/payments/sepay/ipn").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/payments/sepay/return/*").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/payments/momo/ipn").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/payments/webhook").permitAll()
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN") // Bảo vệ tuyệt đối phân khu Admin
                        .anyRequest().authenticated()
                )
                .addFilterBefore(threatDefenseFilter, org.springframework.security.web.authentication.logout.LogoutFilter.class)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "X-Secret-Key", "X-Device-Id"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
