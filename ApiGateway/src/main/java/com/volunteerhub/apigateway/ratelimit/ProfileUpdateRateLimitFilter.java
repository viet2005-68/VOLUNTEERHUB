package com.volunteerhub.apigateway.ratelimit;

import io.micrometer.core.instrument.MeterRegistry;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
public class ProfileUpdateRateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(ProfileUpdateRateLimitFilter.class);
    private static final Pattern PROFILE_UPDATE_PATH = Pattern.compile("^/api/v1/users/users/[^/]+/?$");
    private static final String POLICY = "user_profile_update";
    private static final String METRIC_NAME = "volunteerhub.rate.limit.requests";

    private final StringRedisTemplate redisTemplate;
    private final MeterRegistry meterRegistry;
    private final ProfileUpdateRateLimitProperties properties;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        if (!shouldRateLimit(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            filterChain.doFilter(request, response);
            return;
        }

        String userId = authentication.getName();
        if (!StringUtils.hasText(userId) || "anonymousUser".equals(userId)) {
            filterChain.doFilter(request, response);
            return;
        }

        RateLimitDecision decision = checkLimit(userId);
        addRateLimitHeaders(response, decision);

        record(decision.outcome());

        if (decision.allowed()) {
            filterChain.doFilter(request, response);
            return;
        }

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("""
                {"error":"rate_limit_exceeded","message":"Too many profile updates. Try again later."}
                """);
    }

    private boolean shouldRateLimit(HttpServletRequest request) {
        if (!properties.isEnabled() || !HttpMethod.PUT.matches(request.getMethod())) {
            return false;
        }

        String path = request.getRequestURI();
        String contextPath = request.getContextPath();
        if (StringUtils.hasText(contextPath) && path.startsWith(contextPath)) {
            path = path.substring(contextPath.length());
        }

        return PROFILE_UPDATE_PATH.matcher(path).matches();
    }

    private RateLimitDecision checkLimit(String userId) {
        int limit = properties.getMaxRequests();
        Duration window = properties.getWindow();
        String key = "rate-limit:" + POLICY + ":" + userId;

        try {
            Long count = redisTemplate.opsForValue().increment(key);
            if (count == null) {
                return RateLimitDecision.redisError(limit, limit - 1, window.toSeconds());
            }

            if (count == 1L) {
                redisTemplate.expire(key, window);
            }

            long ttlSeconds = redisTemplate.getExpire(key, TimeUnit.SECONDS);
            if (ttlSeconds <= 0) {
                ttlSeconds = window.toSeconds();
            }

            long remaining = Math.max(0, limit - count);
            boolean allowed = count <= limit;
            String outcome = allowed ? "allowed" : "blocked";
            return new RateLimitDecision(allowed, limit, remaining, ttlSeconds, outcome);
        } catch (RuntimeException ex) {
            log.warn("Profile update rate limit failed open because Redis is unavailable.", ex);
            return RateLimitDecision.redisError(limit, limit - 1, window.toSeconds());
        }
    }

    private void addRateLimitHeaders(HttpServletResponse response, RateLimitDecision decision) {
        response.setHeader("X-RateLimit-Policy", POLICY);
        response.setHeader("X-RateLimit-Limit", String.valueOf(decision.limit()));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(decision.remaining()));
        response.setHeader("X-RateLimit-Reset", String.valueOf(decision.resetSeconds()));
        if (!decision.allowed()) {
            response.setHeader("Retry-After", String.valueOf(decision.resetSeconds()));
        }
    }

    private void record(String outcome) {
        meterRegistry.counter(METRIC_NAME, "policy", POLICY, "outcome", outcome).increment();
    }

    private record RateLimitDecision(boolean allowed, int limit, long remaining, long resetSeconds, String outcome) {
        static RateLimitDecision redisError(int limit, long remaining, long resetSeconds) {
            return new RateLimitDecision(true, limit, Math.max(0, remaining), resetSeconds, "redis_error");
        }
    }
}
