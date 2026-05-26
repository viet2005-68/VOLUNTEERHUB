package com.volunteerhub.AggregationService.service;

import com.volunteerhub.AggregationService.client.EventClient;
import com.volunteerhub.AggregationService.client.RegistrationClient;
import com.volunteerhub.AggregationService.client.UserClient;
import com.volunteerhub.AggregationService.dto.AggregatedUserEventResponse;
import com.volunteerhub.common.dto.EventResponse;
import com.volunteerhub.common.dto.PageResponse;
import com.volunteerhub.common.dto.UserEventResponse;
import com.volunteerhub.common.dto.UserResponse;
import com.volunteerhub.common.enums.UserEventStatus;
import com.volunteerhub.common.utils.ExportUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RegistrationAggregatorService {

    private final RegistrationClient registrationClient;
    private final EventClient eventClient;
    private final UserClient userClient;

    public PageResponse<AggregatedUserEventResponse> getEventRegistration(Long eventId, UserEventStatus status, Integer pageNum, Integer pageSize) {
        PageResponse<UserEventResponse> userEventResponses = registrationClient.findAllByEventId(eventId, status, pageNum, pageSize);
        List<String> userIds = userEventResponses.getContent().stream().map(UserEventResponse::getUserId).toList();
        List<UserResponse> userResponses = userClient.findAllByIds(userIds);
        Map<String, UserResponse> userMap = userResponses.stream()
                .collect(Collectors.toMap(UserResponse::getId, Function.identity()));
        List<AggregatedUserEventResponse> dtoList = userEventResponses.getContent().stream()
                .map(ue -> {
                    UserResponse userResponse = userMap.getOrDefault(ue.getUserId(), UserResponse.builder().build());
                    return AggregatedUserEventResponse.builder()
                            .userEventResponse(ue)
                            .user(userResponse)
                            .build();
                })
                .toList();
        return PageResponse.<AggregatedUserEventResponse>builder()
                .content(dtoList)
                .size(userEventResponses.getSize())
                .number(userEventResponses.getNumber())
                .totalPages(userEventResponses.getTotalPages())
                .totalElements(userEventResponses.getTotalElements())
                .build();
    }

    public PageResponse<AggregatedUserEventResponse> getAllRegistrations(UserEventStatus status, Integer pageNum, Integer pageSize) {
        PageResponse<UserEventResponse> userEventResponses = registrationClient.findAllByUserId(status, pageNum, pageSize);
        List<Long> eventIds = userEventResponses.getContent().stream().map(UserEventResponse::getEventId).toList();
        List<EventResponse> eventResponses = eventClient.getAllEventsByIds(eventIds);
        Map<Long, EventResponse> eventMap = eventResponses.stream()
                .collect(Collectors.toMap(EventResponse::getId, Function.identity()));
        List<AggregatedUserEventResponse> dtoList = userEventResponses.getContent().stream()
                .map(ue -> {
                    EventResponse eventResponse = eventMap.getOrDefault(ue.getEventId(), EventResponse.builder().build());
                    return AggregatedUserEventResponse.builder()
                            .userEventResponse(ue)
                            .event(eventResponse)
                            .build();
                })
                .toList();
        return PageResponse.<AggregatedUserEventResponse>builder()
                .content(dtoList)
                .size(userEventResponses.getSize())
                .number(userEventResponses.getNumber())
                .totalPages(userEventResponses.getTotalPages())
                .totalElements(userEventResponses.getTotalElements())
                .build();
    }

    public PageResponse<AggregatedUserEventResponse> getAllParticipantsByEventId(Long eventId, Integer pageNum, Integer pageSize) {
        PageResponse<UserEventResponse> userEventResponsePageResponses = registrationClient.findAllParticipants(eventId, pageNum, pageSize);
        List<String> userIds = userEventResponsePageResponses.getContent().stream().map(UserEventResponse::getUserId).toList();
        List<UserResponse> userResponses = userClient.findAllByIds(userIds);
        Map<String, UserResponse> userMap = userResponses.stream()
                .collect(Collectors.toMap(UserResponse::getId, Function.identity()));
        List<AggregatedUserEventResponse> dtoList = userEventResponsePageResponses.getContent().stream()
                .map(ue -> {
                    UserResponse userResponse = userMap.getOrDefault(ue.getUserId(), UserResponse.builder().build());
                    return AggregatedUserEventResponse.builder()
                            .userEventResponse(ue)
                            .user(userResponse)
                            .build();
                })
                .toList();
        return PageResponse.<AggregatedUserEventResponse>builder()
                .content(dtoList)
                .size(userEventResponsePageResponses.getSize())
                .number(userEventResponsePageResponses.getNumber())
                .totalPages(userEventResponsePageResponses.getTotalPages())
                .totalElements(userEventResponsePageResponses.getTotalElements())
                .build();
    }

    public byte[] exportAggregatedData(List<AggregatedUserEventResponse> data, String format) {

        if ("json".equalsIgnoreCase(format)) {
            return ExportUtils.toJson(data);
        }

        String[] headers = {
                "Reg ID", "Participant Name", "Email", "Event Name", "Status", "Applied Date"
        };

        return ExportUtils.toCsv(headers, data, item -> {
            var reg = item.getUserEventResponse();
            var user = item.getUser();
            var event = item.getEvent();

            return new Object[] {
                    reg != null ? reg.getId() : "",
                    user != null ? user.getFullName() : "N/A",
                    user != null ? user.getEmail() : "N/A",
                    event != null ? event.getName() : "N/A",
                    reg != null ? reg.getStatus() : "",
                    reg != null && reg.getCreatedAt() != null ? reg.getCreatedAt().toString() : ""
            };
        });
    }

    public List<AggregatedUserEventResponse> getDetailParticipantsForExport(Long eventId) {
        PageResponse<UserEventResponse> registrationPage = registrationClient.findAllParticipants(eventId, 0, 1000);
        List<UserEventResponse> registrations = registrationPage.getContent();

        if (registrations.isEmpty()) return List.of();

        EventResponse event = eventClient.getEventById(eventId);

        List<String> userIds = registrations.stream()
                .map(UserEventResponse::getUserId)
                .distinct()
                .toList();

        List<UserResponse> userResponses = userClient.findAllByIds(userIds);
        Map<String, UserResponse> userMap = userResponses.stream()
                .collect(Collectors.toMap(UserResponse::getId, Function.identity()));

        return registrations.stream()
                .map(ue -> {
                    UserResponse user = userMap.getOrDefault(ue.getUserId(), UserResponse.builder().build());
                    return AggregatedUserEventResponse.builder()
                            .userEventResponse(ue)
                            .user(user)
                            .event(event)
                            .build();
                })
                .toList();
    }
}
