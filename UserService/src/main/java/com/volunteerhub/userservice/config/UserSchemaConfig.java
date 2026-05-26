package com.volunteerhub.userservice.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserSchemaConfig {

    private final JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void widenProfileTextColumns() {
        try {
            widenColumnIfPresent("avatar_url");
            widenColumnIfPresent("bio");
        } catch (Exception e) {
            log.warn("Failed to widen user profile text columns.", e);
        }
    }

    private void widenColumnIfPresent(String columnName) {
        Integer count = jdbcTemplate.queryForObject("""
                select count(*)
                from information_schema.columns
                where table_name = 'users'
                  and column_name = ?
                """, Integer.class, columnName);
        if (count != null && count > 0) {
            jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN " + columnName + " TYPE text");
        }
    }
}
