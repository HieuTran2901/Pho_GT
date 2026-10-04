package com.pho1986.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.util.StringUtils;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${firebase.credentials.path:}")
    private String credentialsPath;

    @Value("${firebase.project.id:}")
    private String projectId;

    @Bean
    public FirebaseApp firebaseApp() {
        if (!FirebaseApp.getApps().isEmpty()) {
            return FirebaseApp.getInstance();
        }

        try {
            InputStream serviceAccountStream = resolveCredentialsStream();
            if (serviceAccountStream == null) {
                log.warn("[FIREBASE] Chua cau hinh credentials (firebase.credentials.path hoac FIREBASE_SERVICE_ACCOUNT_JSON). Backend chay che do sandbox fallback.");
                return null;
            }

            FirebaseOptions.Builder optionsBuilder = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccountStream));

            if (StringUtils.hasText(projectId)) {
                optionsBuilder.setProjectId(projectId);
            }

            FirebaseApp app = FirebaseApp.initializeApp(optionsBuilder.build());
            log.info("[FIREBASE] Khoi tao thanh cong FirebaseApp [{}]", app.getName());
            return app;
        } catch (Exception e) {
            log.error("[FIREBASE] Khoi tao FirebaseApp that bai: {}. Backend tiep tuc chay o che do du phong.", e.getMessage());
            return null;
        }
    }

    @Bean
    public FirebaseAuth firebaseAuth(ObjectProvider<FirebaseApp> firebaseAppProvider) {
        FirebaseApp firebaseApp = firebaseAppProvider.getIfAvailable();
        if (firebaseApp == null) {
            log.warn("[FIREBASE] FirebaseApp khong kha dung. FirebaseAuth khoi tao o che do null-safe.");
            return null;
        }
        return FirebaseAuth.getInstance(firebaseApp);
    }

    private InputStream resolveCredentialsStream() throws Exception {
        // 0. Uu tien nap truc tiep tu cac bien moi truong rieng le (Zero-Disk Secret Architecture)
        String envPrivateKey = System.getenv("FIREBASE_PRIVATE_KEY");
        String envClientEmail = System.getenv("FIREBASE_CLIENT_EMAIL");
        String envProjectId = System.getenv("FIREBASE_PROJECT_ID");
        if (StringUtils.hasText(envPrivateKey) && StringUtils.hasText(envClientEmail)) {
            log.info("[FIREBASE] Nap credentials truc tiep tu bien moi truong rieng le (Zero-Disk)");
            return buildCredentialStreamFromEnv(envPrivateKey, envClientEmail, envProjectId);
        }

        // 1. Uu tien chuoi JSON truc tiep tu bien moi truong
        String rawJsonEnv = System.getenv("FIREBASE_SERVICE_ACCOUNT_JSON");
        if (StringUtils.hasText(rawJsonEnv)) {
            log.info("[FIREBASE] Nap credentials tu bien moi truong FIREBASE_SERVICE_ACCOUNT_JSON");
            return new ByteArrayInputStream(rawJsonEnv.getBytes(StandardCharsets.UTF_8));
        }

        // 2. Uu tien duong dan file tu application.properties hoac bien moi truong FIREBASE_CONFIG_PATH
        String path = StringUtils.hasText(credentialsPath) ? credentialsPath : System.getenv("FIREBASE_CONFIG_PATH");
        if (StringUtils.hasText(path)) {
            Resource resource = path.startsWith("classpath:")
                    ? new ClassPathResource(path.substring("classpath:".length()))
                    : new FileSystemResource(path);

            if (resource.exists()) {
                log.info("[FIREBASE] Nap credentials tu file duong dan: {}", path);
                return resource.getInputStream();
            }
        }

        // 3. Fallback tim file mac dinh firebase-service-account.json trong classpath (neu khong phai file placeholder)
        ClassPathResource defaultClasspath = new ClassPathResource("firebase-service-account.json");
        if (defaultClasspath.exists()) {
            try (InputStream is = defaultClasspath.getInputStream()) {
                String content = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                if (!content.contains("REPLACED_BY_") && !content.contains("PLACEHOLDER")) {
                    log.info("[FIREBASE] Nap credentials tu default classpath resource: firebase-service-account.json");
                    return new ByteArrayInputStream(content.getBytes(StandardCharsets.UTF_8));
                }
            } catch (Exception ignored) {
                // Bo qua neu file loi hoac la placeholder
            }
        }

        return null;
    }

    private InputStream buildCredentialStreamFromEnv(String privateKey, String clientEmail, String envProjectId) {
        String effectiveProjectId = StringUtils.hasText(envProjectId) ? envProjectId.trim() : (StringUtils.hasText(projectId) ? projectId.trim() : "pho-gt");
        String normalizedKey = privateKey.trim();
        if (normalizedKey.contains("\r") || normalizedKey.contains("\n")) {
            normalizedKey = normalizedKey.replace("\r\n", "\\n").replace("\r", "\\n").replace("\n", "\\n");
        }
        String json = "{\n" +
                "  \"type\": \"service_account\",\n" +
                "  \"project_id\": \"" + effectiveProjectId + "\",\n" +
                "  \"private_key\": \"" + normalizedKey + "\",\n" +
                "  \"client_email\": \"" + clientEmail.trim() + "\"\n" +
                "}";
        return new ByteArrayInputStream(json.getBytes(StandardCharsets.UTF_8));
    }
}
