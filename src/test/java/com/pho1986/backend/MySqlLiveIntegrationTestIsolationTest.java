package com.pho1986.backend;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;

import static org.junit.jupiter.api.Assertions.*;

public class MySqlLiveIntegrationTestIsolationTest {

    @Test
    @DisplayName("R3: Verify MySqlLiveIntegrationTest has @Tag('integration')")
    void testIntegrationTagPresent() {
        Tag tag = MySqlLiveIntegrationTest.class.getAnnotation(Tag.class);
        assertNotNull(tag, "MySqlLiveIntegrationTest must have @Tag annotation");
        assertEquals("integration", tag.value(), "Tag value must be 'integration'");
    }

    @Test
    @DisplayName("R3: Verify MySqlLiveIntegrationTest is guarded with @EnabledIfSystemProperty(named = 'live.mysql.enabled', matches = 'true')")
    void testEnabledIfSystemPropertyPresent() {
        EnabledIfSystemProperty annotation = MySqlLiveIntegrationTest.class.getAnnotation(EnabledIfSystemProperty.class);
        assertNotNull(annotation, "MySqlLiveIntegrationTest must have @EnabledIfSystemProperty annotation");
        assertEquals("live.mysql.enabled", annotation.named(), "Property name must be 'live.mysql.enabled'");
        assertEquals("true", annotation.matches(), "Property match regex must be 'true'");
    }

    @Test
    @DisplayName("R3: Verify default hermetic execution skips live MySQL test when property is absent or false")
    void testHermeticSkippingBehavior() {
        // When live.mysql.enabled is not set or false:
        String prevVal = System.getProperty("live.mysql.enabled");
        try {
            System.clearProperty("live.mysql.enabled");
            String currentVal = System.getProperty("live.mysql.enabled");
            assertNull(currentVal, "live.mysql.enabled should default to absent in hermetic test runs");

            EnabledIfSystemProperty annotation = MySqlLiveIntegrationTest.class.getAnnotation(EnabledIfSystemProperty.class);
            boolean isEnabledWhenAbsent = currentVal != null && currentVal.matches(annotation.matches());
            assertFalse(isEnabledWhenAbsent, "Test must be disabled when property is absent");

            System.setProperty("live.mysql.enabled", "false");
            boolean isEnabledWhenFalse = System.getProperty("live.mysql.enabled").matches(annotation.matches());
            assertFalse(isEnabledWhenFalse, "Test must be disabled when property is 'false'");

            System.setProperty("live.mysql.enabled", "true");
            boolean isEnabledWhenTrue = System.getProperty("live.mysql.enabled").matches(annotation.matches());
            assertTrue(isEnabledWhenTrue, "Test must be enabled when property is 'true'");
        } finally {
            if (prevVal != null) {
                System.setProperty("live.mysql.enabled", prevVal);
            } else {
                System.clearProperty("live.mysql.enabled");
            }
        }
    }
}
