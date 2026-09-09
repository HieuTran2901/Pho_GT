package com.pho1986.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class AwsS3Config {

    private static final Logger log = LoggerFactory.getLogger(AwsS3Config.class);

    @Value("${aws.s3.bucket-name:pho-medial-assets}")
    private String bucketName;

    @Value("${aws.s3.region:ap-southeast-1}")
    private String region;

    @Value("${aws.s3.access-key:}")
    private String accessKey;

    @Value("${aws.s3.secret-key:}")
    private String secretKey;

    @Bean
    public S3Client s3Client() {
        AwsCredentialsProvider credentialsProvider;

        if (StringUtils.hasText(accessKey) && StringUtils.hasText(secretKey)) {
            log.info("[CLOUD & SENTINEL] Khởi tạo S3Client với Static Credentials (Region: {}, Bucket: {})", region, bucketName);
            credentialsProvider = StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey.trim(), secretKey.trim())
            );
        } else {
            log.info("[CLOUD & SENTINEL] Khởi tạo S3Client với DefaultCredentialsProvider (Region: {}, Bucket: {})", region, bucketName);
            credentialsProvider = DefaultCredentialsProvider.create();
        }

        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(credentialsProvider)
                .build();
    }

    public String getBucketName() {
        return bucketName;
    }

    public String getRegion() {
        return region;
    }

    public boolean hasExplicitCredentials() {
        return StringUtils.hasText(accessKey) && StringUtils.hasText(secretKey);
    }
}
