package com.volunteerhub.apigateway.ratelimit;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@ConfigurationProperties(prefix = "app.rate-limit.user-profile-update")
public class ProfileUpdateRateLimitProperties {

    private boolean enabled = true;
    private int maxRequests = 5;
    private Duration window = Duration.ofMinutes(1);

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public int getMaxRequests() {
        return Math.max(1, maxRequests);
    }

    public void setMaxRequests(int maxRequests) {
        this.maxRequests = maxRequests;
    }

    public Duration getWindow() {
        if (window == null || window.isZero() || window.isNegative()) {
            return Duration.ofMinutes(1);
        }
        return window;
    }

    public void setWindow(Duration window) {
        this.window = window;
    }
}
