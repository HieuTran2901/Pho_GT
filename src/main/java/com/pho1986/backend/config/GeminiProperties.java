package com.pho1986.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Configuration
@ConfigurationProperties(prefix = "app.gemini")
public class GeminiProperties {

    public static final String DEFAULT_MODEL = "gemini-3.8-flash";
    private static final List<String> FALLBACK_MODELS = List.of(
            "gemini-3.8-flash",
            "gemini-3.5-flash-lite",
            "gemini-flash-latest"
    );

    private String apiKey = "";
    private String model = DEFAULT_MODEL;
    private String endpoint = "https://generativelanguage.googleapis.com/v1beta/models";

    public GeminiProperties() {
    }

    private static String normalizeModel(String rawModel) {
        if (rawModel == null || rawModel.trim().isEmpty()) {
            return DEFAULT_MODEL;
        }
        String trimmed = rawModel.trim();
        if ("gemini-3.6-flash".equalsIgnoreCase(trimmed)) {
            return DEFAULT_MODEL;
        }
        return trimmed;
    }

    public boolean isConfigured() {
        String key = getApiKey();
        return key != null && !key.trim().isEmpty();
    }

    public String getApiKey() {
        if (apiKey != null && !apiKey.trim().isEmpty()) {
            return apiKey.trim();
        }
        String envKey = System.getenv("GEMINI_API_KEY");
        return envKey != null ? envKey.trim() : "";
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
    }

    public String getModel() {
        return normalizeModel(model);
    }

    public void setModel(String model) {
        this.model = normalizeModel(model);
    }

    public List<String> getCandidateModels() {
        Set<String> ordered = new LinkedHashSet<>();
        ordered.add(getModel());
        ordered.addAll(FALLBACK_MODELS);
        return new ArrayList<>(ordered);
    }

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }
}
