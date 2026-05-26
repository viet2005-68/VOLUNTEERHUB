package com.volunteerhub.notificationservice.config;

import com.volunteerhub.notificationservice.model.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationSchemaConfig {

    private final JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void syncNotificationTypeConstraint() {
        String allowedTypes = Arrays.stream(NotificationType.values())
                .map(type -> "'" + type.name() + "'::character varying")
                .collect(Collectors.joining(", "));
        try {
            jdbcTemplate.execute("ALTER TABLE notification DROP CONSTRAINT IF EXISTS notification_type_check");
            jdbcTemplate.execute("ALTER TABLE notification ADD CONSTRAINT notification_type_check "
                    + "CHECK ((type)::text = ANY ((ARRAY[" + allowedTypes + "])::text[]))");
        } catch (Exception e) {
            log.warn("Failed to sync notification type check constraint.", e);
        }
    }
}
