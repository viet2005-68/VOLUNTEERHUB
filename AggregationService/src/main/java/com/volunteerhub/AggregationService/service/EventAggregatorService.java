package com.volunteerhub.AggregationService.service;

import com.volunteerhub.AggregationService.client.CommunityClient;
import com.volunteerhub.AggregationService.client.EventClient;
import com.volunteerhub.AggregationService.client.RegistrationClient;
import com.volunteerhub.AggregationService.client.UserClient;
import com.volunteerhub.AggregationService.dto.AggregatedEventResponse;
import com.volunteerhub.AggregationService.dto.EventCommunityStats;
import com.volunteerhub.AggregationService.dto.TrendingEventResponse;
import com.volunteerhub.common.dto.*;
import com.volunteerhub.common.enums.EventStatus;
import com.volunteerhub.common.utils.ExportUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class EventAggregatorService {

    private final EventClient eventClient;
    private final RegistrationClient registrationClient;
    private final UserClient userClient;
    private final CommunityClient communityClient;

    public PageResponse<AggregatedEventResponse> getAggregatedEvents(
            Integer pageNum, Integer pageSize, EventStatus status,
            String category, LocalDateTime startAfter, LocalDateTime endBefore,
            String province, String district, String street,
            String sortedBy, String order
    ) {
        PageResponse<EventResponse> events = eventClient.getAllEvents(
                pageNum, pageSize, status, category, startAfter, endBefore,
                province, district, street, sortedBy, order
        );
        return enrichEventsPage(events);
    }

    public PageResponse<AggregatedEventResponse> getAggregatedOwnedEvents(
            Integer pageNum, Integer pageSize, EventStatus status,
            String category, LocalDateTime startAfter, LocalDateTime endBefore,
            String province, String district, String street,
            String sortedBy, String order
    ) {
        PageResponse<EventResponse> events = eventClient.getAllOwnedEvents(
                pageNum, pageSize, status, category, startAfter, endBefore,
                province, district, street, sortedBy, order
        );
        return enrichEventsPage(events);
    }

    public AggregatedEventResponse getAggregatedEventById(Long eventId) {
        EventResponse eventResponse = eventClient.getEventById(eventId);
        String ownerId = eventResponse.getOwnerId();
        UserResponse userResponse = userClient.findById(ownerId);
        PageResponse<EventRegistrationCount> responsePage =
                registrationClient.getEventsParticipantCounts(List.of(eventId), null, null, null);

        EventRegistrationCount totalCounts = responsePage.getContent().stream()
                .findFirst()
                .orElse(createEmptyCount(eventId));
        List<String> ownerIds = Collections.singletonList(ownerId);
        Map<String, Long> ownerEventCounts = getOwnerEventCounts(ownerIds);
        Map<String, Long> ownerVolunteerCounts = getOwnerVolunteerCounts(ownerIds);
        return AggregatedEventResponse.builder()
                .eventResponse(eventResponse)
                .owner(userResponse)
                .registrationCount(totalCounts.getRegistrationCount())
                .participantCount(totalCounts.getParticipantCount())
                .ownerTotalEvents(resolveOwnerTotalEvents(ownerId, userResponse, ownerEventCounts))
                .ownerTotalVolunteers(ownerVolunteerCounts.getOrDefault(ownerId, 0L))
                .build();
    }

    public PageResponse<AggregatedEventResponse> searchAggregatedEvents(String keyword, EventStatus status, Integer pageNum, Integer pageSize) {
        PageResponse<EventResponse> events = eventClient.searchEvents(keyword, status, pageNum, pageSize);
        return enrichEventsPage(events);
    }

    public PageResponse<AggregatedEventResponse> searchAggregatedOwnedEvents(String keyword, EventStatus status, Integer pageNum, Integer pageSize) {
        PageResponse<EventResponse> events = eventClient.searchOwnedEvents(keyword, status, pageNum, pageSize);
        return enrichEventsPage(events);
    }

//    public List<TrendingEventResponse> getTrendingEvents(Integer pageNum, Integer pageSize, Integer days) {
//        List<EventRegistrationCount> growthCounts = registrationClient.getEventsParticipantCounts(null, pageNum, pageSize, days);
//
//        if (growthCounts == null || growthCounts.isEmpty()) {
//            return Collections.emptyList();
//        }
//
//        List<Long> eventIds = growthCounts.stream().map(EventRegistrationCount::getEventId).toList();
//        List<EventResponse> eventResponses = eventClient.getAllEventsByIds(eventIds);
//        List<EventRegistrationCount> totalCounts = registrationClient.getEventsParticipantCounts(eventIds, null, null, null);
//
//        List<String> userIds = eventResponses.stream().map(EventResponse::getOwnerId).distinct().toList();
//        List<UserResponse> userResponses = userClient.findAllByIds(userIds);
//
//        Map<Long, EventRegistrationCount> totalCountMap = totalCounts.stream()
//                .collect(Collectors.toMap(EventRegistrationCount::getEventId, Function.identity()));
//        Map<Long, EventRegistrationCount> growthCountMap = growthCounts.stream()
//                .collect(Collectors.toMap(EventRegistrationCount::getEventId, Function.identity()));
//        Map<String, UserResponse> userMap = userResponses.stream()
//                .collect(Collectors.toMap(UserResponse::getId, Function.identity()));
//
//        return eventResponses.stream()
//                .map(e -> {
//                    EventRegistrationCount total = totalCountMap.getOrDefault(e.getId(), createEmptyCount(e.getId()));
//                    EventRegistrationCount growth = growthCountMap.getOrDefault(e.getId(), createEmptyCount(e.getId()));
//                    UserResponse user = userMap.getOrDefault(e.getOwnerId(), UserResponse.builder().build());
//                    Long commentCount = communityClient.getCommentCountInLastDays(e.getId(), days);
//                    Long postCount = communityClient.getPostCountInLastDays(e.getId(), days);
//                    Long reactionCount = communityClient.getReactionCountInLastDays(e.getId(), days);
//                    return TrendingEventResponse.builder()
//                            .eventResponse(AggregatedEventResponse.builder()
//                                    .owner(user)
//                                    .eventResponse(e)
//                                    .participantCount(total.getParticipantCount())
//                                    .registrationCount(total.getRegistrationCount())
//                                    .build())
//                            .registrationGrowth(growth.getRegistrationCount())
//                            .participantGrowth(growth.getParticipantCount())
//                            .postGrowth(postCount)
//                            .commentGrowth(commentCount)
//                            .reactionGrowth(reactionCount)
//                            .build();
//                })
//                .toList();
//    }

    public PageResponse<TrendingEventResponse> getTrendingEvents(Integer pageNum, Integer pageSize, Integer days) {
        final double W_REGISTRATION = 5.0;
        final double W_POST = 3.0;
        final double W_COMMENT = 1.0;
        final double W_REACTION = 0.5;

        int poolSize = 50;
        PageResponse<EventRegistrationCount> candidatePage = registrationClient.getEventsParticipantCounts(null, 0, poolSize, days);

        if (candidatePage == null || candidatePage.getContent().isEmpty()) {
            return PageResponse.<TrendingEventResponse>builder()
                    .content(Collections.emptyList()).build();
        }

        List<EventRegistrationCount> candidates = candidatePage.getContent();
        List<Long> eventIds = candidates.stream().map(EventRegistrationCount::getEventId).toList();

        List<EventResponse> eventResponses = eventClient.getAllEventsByIds(eventIds);
        Map<Long, EventResponse> eventMap = eventResponses.stream()
                .collect(Collectors.toMap(EventResponse::getId, Function.identity()));

        List<String> userIds = eventResponses.stream().map(EventResponse::getOwnerId).distinct().toList();
        Map<String, UserResponse> userMap = userClient.findAllByIds(userIds).stream()
                .collect(Collectors.toMap(UserResponse::getId, Function.identity()));
        Map<String, Long> ownerEventCounts = getOwnerEventCounts(userIds);
        Map<String, Long> ownerVolunteerCounts = getOwnerVolunteerCounts(userIds);

        Map<Long, EventRegistrationCount> totalCountMap = registrationClient.getEventsParticipantCounts(eventIds, null, null, null)
                .getContent().stream()
                .collect(Collectors.toMap(EventRegistrationCount::getEventId, Function.identity()));

        List<TrendingEventResponse> scoredList = candidates.stream()
                .map(growth -> {
                    Long eventId = growth.getEventId();
                    EventResponse event = eventMap.get(eventId);
                    if (event == null) return null;

                    EventCommunityStats stats = communityClient.getEventAllStats(eventId, days);

                    double trendingScore = (growth.getRegistrationCount() * W_REGISTRATION) +
                            (stats.getPostCount() * W_POST) +
                            (stats.getCommentCount() * W_COMMENT) +
                            (stats.getReactionCount() * W_REACTION);

                    EventRegistrationCount total = totalCountMap.getOrDefault(eventId, createEmptyCount(eventId));
                    UserResponse owner = userMap.getOrDefault(event.getOwnerId(), UserResponse.builder().build());

                    return TrendingEventResponse.builder()
                            .eventResponse(AggregatedEventResponse.builder()
                                    .eventResponse(event)
                                    .owner(owner)
                                    .registrationCount(total.getRegistrationCount())
                                    .participantCount(total.getParticipantCount())
                                    .ownerTotalEvents(resolveOwnerTotalEvents(event.getOwnerId(), owner, ownerEventCounts))
                                    .ownerTotalVolunteers(ownerVolunteerCounts.getOrDefault(event.getOwnerId(), 0L))
                                    .build())
                            .registrationGrowth(growth.getRegistrationCount())
                            .participantGrowth(growth.getParticipantCount())
                            .postGrowth(stats.getPostCount())
                            .commentGrowth(stats.getCommentCount())
                            .reactionGrowth(stats.getReactionCount())
                            .trendingScore(trendingScore)
                            .build();
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingDouble(TrendingEventResponse::getTrendingScore).reversed())
                .toList();

        int start = pageNum * pageSize;
        int end = Math.min((pageNum + 1) * pageSize, scoredList.size());

        List<TrendingEventResponse> pagedContent;
        if (start >= scoredList.size()) {
            pagedContent = Collections.emptyList();
        } else {
            pagedContent = scoredList.subList(start, end);
        }

        return PageResponse.<TrendingEventResponse>builder()
                .content(pagedContent)
                .number(pageNum)
                .size(pageSize)
                .totalElements(scoredList.size())
                .totalPages((int) Math.ceil((double) scoredList.size() / pageSize))
                .build();
    }

    public List<UserResponse> getEventUsers(Long eventId, Integer pageNum, Integer pageSize) {
        List<String> userIds = registrationClient.findUserIdsByEventId(eventId, pageNum, pageSize);
        return userClient.findAllByIds(userIds);
    }

    private PageResponse<AggregatedEventResponse> enrichEventsPage(PageResponse<EventResponse> events) {
        if (events == null || events.getContent() == null || events.getContent().isEmpty()) {
            return PageResponse.<AggregatedEventResponse>builder()
                    .content(Collections.emptyList())
                    .totalElements(0)
                    .totalPages(0)
                    .number(events != null ? events.getNumber() : 0)
                    .size(events != null ? events.getSize() : 0)
                    .build();
        }

        List<EventResponse> content = events.getContent();

        List<Long> eventIds = content.stream()
                .map(EventResponse::getId)
                .toList();

        List<String> userIds = content.stream()
                .map(EventResponse::getOwnerId)
                .distinct()
                .toList();

        List<EventRegistrationCount> eventRegistrationCounts =
                registrationClient.getEventsParticipantCounts(eventIds, null, null, null).getContent();

        List<UserResponse> userResponses =
                userClient.findAllByIds(userIds);

        Map<Long, EventRegistrationCount> countMap = eventRegistrationCounts.stream()
                .collect(Collectors.toMap(EventRegistrationCount::getEventId, Function.identity()));

        Map<String, UserResponse> userMap = userResponses.stream()
                .collect(Collectors.toMap(UserResponse::getId, Function.identity()));

        Map<String, Long> ownerEventCounts = getOwnerEventCounts(userIds);
        Map<String, Long> ownerVolunteerCounts = getOwnerVolunteerCounts(userIds);

        List<AggregatedEventResponse> aggregated = content.stream()
                .map(e -> {
                    EventRegistrationCount counts =
                            countMap.getOrDefault(e.getId(), createEmptyCount(e.getId()));

                    UserResponse owner =
                            userMap.getOrDefault(e.getOwnerId(), UserResponse.builder().build());

                    return AggregatedEventResponse.builder()
                            .eventResponse(e)
                            .owner(owner)
                            .registrationCount(counts.getRegistrationCount())
                            .participantCount(counts.getParticipantCount())
                            .ownerTotalEvents(resolveOwnerTotalEvents(e.getOwnerId(), owner, ownerEventCounts))
                            .ownerTotalVolunteers(ownerVolunteerCounts.getOrDefault(e.getOwnerId(), 0L))
                            .build();
                })
                .toList();
        return PageResponse.<AggregatedEventResponse>builder()
                .content(aggregated)
                .totalElements(events.getTotalElements())
                .totalPages(events.getTotalPages())
                .number(events.getNumber())
                .size(events.getSize())
                .build();
    }


    private Map<String, Long> getOwnerEventCounts(List<String> ownerIds) {
        List<String> distinctOwnerIds = normalizeOwnerIds(ownerIds);
        if (distinctOwnerIds.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<String, Long> counts = eventClient.countEventsByOwnerIds(distinctOwnerIds);
        return counts == null ? Collections.emptyMap() : counts;
    }

    private Map<String, Long> getOwnerVolunteerCounts(List<String> ownerIds) {
        List<String> distinctOwnerIds = normalizeOwnerIds(ownerIds);
        if (distinctOwnerIds.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<String, Long> counts = registrationClient.countUniqueVolunteersByOwnerIds(distinctOwnerIds);
        return counts == null ? Collections.emptyMap() : counts;
    }

    private List<String> normalizeOwnerIds(List<String> ownerIds) {
        if (ownerIds == null) {
            return Collections.emptyList();
        }

        return ownerIds.stream()
                .filter(Objects::nonNull)
                .distinct()
                .toList();
    }

    private Long resolveOwnerTotalEvents(String ownerId, UserResponse owner, Map<String, Long> ownerEventCounts) {
        Long countedEvents = ownerEventCounts.get(ownerId);
        if (countedEvents != null) {
            return countedEvents;
        }
        if (owner != null && owner.getTotalEvents() != null) {
            return owner.getTotalEvents().longValue();
        }
        return 0L;
    }

    private EventRegistrationCount createEmptyCount(Long eventId) {
        return EventRegistrationCount.builder()
                .eventId(eventId)
                .registrationCount(0L)
                .participantCount(0L)
                .build();
    }

    public byte[] exportAllEvents(String format) {
        PageResponse<EventResponse> eventsPage = eventClient.getAllEvents(
                0, 1000, null, null, null, null, null, null, null, null, null
        );
        List<AggregatedEventResponse> aggregatedData = enrichEventsPage(eventsPage).getContent();

        if ("json".equalsIgnoreCase(format)) {
            return ExportUtils.toJson(aggregatedData);
        }

        String[] headers = {
                "Event ID", "Tên Sự Kiện", "Danh Mục", "Trạng Thái", "Chủ Sở Hữu",
                "Email Chủ Sở Hữu", "Bắt Đầu", "Kết Thúc", "Sức Chứa", "Đăng Ký", "Tham Gia"
        };

        return ExportUtils.toCsv(headers, aggregatedData, item -> {
            var e = item.getEventResponse();
            var owner = item.getOwner();
            return new Object[] {
                    e.getId(), e.getName(),
                    e.getCategory() != null ? e.getCategory().getName() : "N/A",
                    e.getStatus(),
                    owner != null ? owner.getFullName() : "N/A",
                    owner != null ? owner.getEmail() : "N/A",
                    e.getStartTime(), e.getEndTime(),
                    e.getCapacity(),
                    formatAddress(e.getAddress()),
                    item.getRegistrationCount(),
                    item.getParticipantCount()
            };
        });
    }
    private String formatAddress(AddressResponse addr) {
        if (addr == null) return "N/A";

        String formatted = Stream.of(addr.getStreet(), addr.getDistrict(), addr.getProvince())
                .filter(s -> s != null && !s.isBlank())
                .collect(Collectors.joining(", "));

        return formatted.isEmpty() ? "N/A" : formatted;
    }
}