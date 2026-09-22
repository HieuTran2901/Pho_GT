package com.pho1986.backend.config;

import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.ConfigurableEnvironment;

@Configuration
public class ProductionSecurityValidatorConfig {

    private final ConfigurableEnvironment environment;

    public ProductionSecurityValidatorConfig(ConfigurableEnvironment environment) {
        this.environment = environment;
    }

    @PostConstruct
    public void validateOnStartup() {
        if (ProductionSecretEnvironmentPostProcessor.isProdEnvironment(environment)) {
            new ProductionSecretEnvironmentPostProcessor().postProcessEnvironment(environment, null);
        }
    }
}
