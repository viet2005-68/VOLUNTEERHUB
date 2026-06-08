package com.volunteerhub.AggregationService.service;

import com.volunteerhub.AggregationService.client.ChatClient;
import com.volunteerhub.AggregationService.client.EventClient;
import com.volunteerhub.AggregationService.client.UserClient;
import com.volunteerhub.AggregationService.dto.AggregatedChatConversationResponse;
import com.volunteerhub.AggregationService.dto.AggregatedChatMessageResponse;
import com.volunteerhub.AggregationService.dto.ChatConversationResponse;
import com.volunteerhub.AggregationService.dto.ChatMessageResponse;
import com.volunteerhub.common.dto.EventResponse;
import com.volunteerhub.common.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ChatAggregatorService {

    private final ChatClient chatClient;
    private final EventClient eventClient;
    private final UserClient userClient;

    public List<AggregatedChatConversationResponse> listConversations(Long eventId) {
        List<ChatConversationResponse> conversations = chatClient.listConversations(eventId);
        if (conversations == null || conversations.isEmpty()) {
            return List.of();
        }

        Map<Long, EventResponse> events = fetchEvents(conversations.stream()
                .map(ChatConversationResponse::getEventId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));
        Map<String, UserResponse> users = fetchUsers(conversations.stream()
                .flatMap(conversation -> Stream.of(conversation.getManagerId(), conversation.getVolunteerId()))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));

        return conversations.stream()
                .map(conversation -> {
                    EventResponse event = events.get(conversation.getEventId());
                    UserResponse manager = users.get(conversation.getManagerId());
                    UserResponse volunteer = users.get(conversation.getVolunteerId());
                    return AggregatedChatConversationResponse.builder()
                            .conversation(conversation)
                            .eventName(event == null ? null : event.getName())
                            .event(event)
                            .manager(manager)
                            .volunteer(volunteer)
                            .otherUser(users.get(conversation.getOtherUserId()))
                            .build();
                })
                .toList();
    }

    public List<AggregatedChatMessageResponse> listMessages(Long conversationId, LocalDateTime before, Integer limit) {
        List<ChatMessageResponse> messages = chatClient.listMessages(conversationId, before, limit);
        if (messages == null || messages.isEmpty()) {
            return List.of();
        }

        Map<String, UserResponse> users = fetchUsers(messages.stream()
                .map(ChatMessageResponse::getSenderId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()));

        return messages.stream()
                .map(message -> AggregatedChatMessageResponse.builder()
                        .message(message)
                        .sender(users.get(message.getSenderId()))
                        .build())
                .toList();
    }

    private Map<Long, EventResponse> fetchEvents(Collection<Long> eventIds) {
        if (eventIds == null || eventIds.isEmpty()) {
            return Map.of();
        }
        List<EventResponse> events = eventClient.getAllEventsByIds(List.copyOf(eventIds));
        if (events == null) {
            return Map.of();
        }
        return events.stream()
                .filter(event -> event.getId() != null)
                .collect(Collectors.toMap(EventResponse::getId, Function.identity(), (first, second) -> first));
    }

    private Map<String, UserResponse> fetchUsers(Set<String> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Map.of();
        }
        List<UserResponse> users = userClient.findAllByIds(List.copyOf(userIds));
        if (users == null) {
            return Map.of();
        }
        return users.stream()
                .filter(user -> user.getId() != null)
                .collect(Collectors.toMap(UserResponse::getId, Function.identity(), (first, second) -> first));
    }
}
