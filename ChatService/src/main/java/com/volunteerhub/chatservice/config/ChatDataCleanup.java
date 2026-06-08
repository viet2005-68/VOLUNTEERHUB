package com.volunteerhub.chatservice.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatDataCleanup implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        int attachments = jdbcTemplate.update("""
                DELETE FROM chat_message_attachment
                WHERE message_id IN (
                    SELECT m.id
                    FROM chat_message m
                    JOIN chat_conversation c ON c.id = m.conversation_id
                    WHERE c.manager_id = c.volunteer_id
                )
                """);

        int messages = jdbcTemplate.update("""
                DELETE FROM chat_message
                WHERE conversation_id IN (
                    SELECT id
                    FROM chat_conversation
                    WHERE manager_id = volunteer_id
                )
                """);

        int readStates = jdbcTemplate.update("""
                DELETE FROM chat_read_state
                WHERE conversation_id IN (
                    SELECT id
                    FROM chat_conversation
                    WHERE manager_id = volunteer_id
                )
                """);

        int conversations = jdbcTemplate.update("""
                DELETE FROM chat_conversation
                WHERE manager_id = volunteer_id
                """);

        if (conversations > 0 || messages > 0 || attachments > 0 || readStates > 0) {
            log.warn(
                    "Cleaned invalid self chat data: conversations={}, messages={}, attachments={}, readStates={}",
                    conversations,
                    messages,
                    attachments,
                    readStates
            );
        }
    }
}
