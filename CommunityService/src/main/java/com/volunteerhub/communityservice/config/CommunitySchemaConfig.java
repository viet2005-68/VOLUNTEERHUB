package com.volunteerhub.communityservice.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class CommunitySchemaConfig {

    private final JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void syncPostShareCountColumn() {
        try {
            jdbcTemplate.execute("ALTER TABLE post ALTER COLUMN content TYPE text");
            jdbcTemplate.execute("ALTER TABLE post ADD COLUMN IF NOT EXISTS share_count integer DEFAULT 0");
            jdbcTemplate.execute("UPDATE post SET share_count = 0 WHERE share_count IS NULL");
            jdbcTemplate.execute("ALTER TABLE post ALTER COLUMN share_count SET DEFAULT 0");
            jdbcTemplate.execute("ALTER TABLE post ALTER COLUMN share_count SET NOT NULL");
        } catch (Exception e) {
            log.warn("Failed to sync post schema.", e);
        }
    }
}
