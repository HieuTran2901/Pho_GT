package com.pho1986.backend.service;

import com.pho1986.backend.config.AwsS3Config;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.io.InputStream;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class S3StorageService {

    private static final Logger log = LoggerFactory.getLogger(S3StorageService.class);

    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/svg+xml"
    );

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    private final S3Client s3Client;
    private final AwsS3Config awsS3Config;

    public S3StorageService(S3Client s3Client, AwsS3Config awsS3Config) {
        this.s3Client = s3Client;
        this.awsS3Config = awsS3Config;
    }

    /**
     * Tải file ảnh lên S3 bucket trong thư mục dishes/
     *
     * @param file File ảnh được gửi từ client
     * @return Public URL của ảnh trên Amazon S3
     */
    public String uploadDishImage(MultipartFile file) {
        validateImageFile(file);

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "dish_image.jpg"
        );
        String extension = getFileExtension(originalFilename);
        String baseName = getBaseName(originalFilename);
        String slug = toSlug(baseName);

        String datePrefix = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);
        String s3Key = String.format("dishes/%s_%s_%s.%s", datePrefix, uniqueSuffix, slug, extension);

        String bucketName = awsS3Config.getBucketName();
        String region = awsS3Config.getRegion();
        String contentType = file.getContentType() != null ? file.getContentType() : "image/jpeg";

        log.info("[CLOUD] Bắt đầu upload ảnh lên S3: bucket={}, key={}, size={} bytes, contentType={}",
                bucketName, s3Key, file.getSize(), contentType);

        try (InputStream inputStream = file.getInputStream()) {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .contentType(contentType)
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(inputStream, file.getSize()));

            String publicUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, s3Key);
            log.info("[CLOUD] Upload ảnh lên S3 thành công! URL: {}", publicUrl);
            return publicUrl;
        } catch (S3Exception e) {
            log.error("[CLOUD] Lỗi AWS S3 khi upload: code={}, message={}", e.awsErrorDetails().errorCode(), e.getMessage());
            throw new IllegalStateException("Lỗi từ Amazon S3: " + e.awsErrorDetails().errorMessage(), e);
        } catch (SdkClientException e) {
            log.error("[CLOUD] Lỗi AWS SDK Client (chưa cấu hình credentials hoặc không có kết nối mạng): {}", e.getMessage());
            throw new IllegalStateException("Không thể kết nối tới Amazon S3. Vui lòng kiểm tra AWS Credentials (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY) hoặc kết nối mạng.", e);
        } catch (IOException e) {
            log.error("[CLOUD] Lỗi đọc luồng dữ liệu file: {}", e.getMessage());
            throw new IllegalStateException("Lỗi đọc dữ liệu tệp ảnh tải lên: " + e.getMessage(), e);
        }
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn một tệp ảnh để tải lên.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("Kích thước tệp vượt quá giới hạn cho phép (tối đa 10MB).");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException("Định dạng tệp không hợp lệ. Chỉ chấp nhận các tệp ảnh: JPEG, PNG, WEBP, GIF, SVG.");
        }
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < filename.length() - 1) {
            return filename.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
        }
        return "jpg";
    }

    private String getBaseName(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex > 0) {
            return filename.substring(0, dotIndex);
        }
        return filename;
    }

    private String toSlug(String input) {
        if (input == null || input.isBlank()) {
            return "pho";
        }
        String nowhitespace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        slug = slug.toLowerCase(Locale.ROOT).replaceAll("-+", "-");
        if (slug.startsWith("-")) slug = slug.substring(1);
        if (slug.endsWith("-")) slug = slug.substring(0, slug.length() - 1);
        return slug.length() > 30 ? slug.substring(0, 30) : slug;
    }
}
