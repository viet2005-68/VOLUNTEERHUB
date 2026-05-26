package com.volunteerhub.registrationservice.service;

import com.volunteerhub.common.dto.EventRegistrationCount;
import com.volunteerhub.common.dto.PageResponse;
import com.volunteerhub.common.dto.RegistrationResponse;
import com.volunteerhub.common.dto.UserEventResponse;
import com.volunteerhub.common.dto.analytics.AnalyticsTrendPoint;
import com.volunteerhub.common.dto.analytics.RegistrationAnalyticsSummary;
import com.volunteerhub.common.enums.EventStatus;
import com.volunteerhub.common.enums.UserEventStatus;
import com.volunteerhub.common.utils.PageNumAndSizeResponse;
import com.volunteerhub.common.utils.PaginationValidation;
import com.volunteerhub.registrationservice.dto.ChatParticipantContext;
import com.volunteerhub.registrationservice.dto.UserEventExport;
import com.volunteerhub.registrationservice.dto.UserEventRequest;
import com.volunteerhub.registrationservice.mapper.UserEventMapper;
import com.volunteerhub.registrationservice.model.EventSnapshot;
import com.volunteerhub.registrationservice.model.UserEvent;
import com.volunteerhub.registrationservice.publisher.RegistrationPublisher;
import com.volunteerhub.registrationservice.repository.EventSnapshotRepository;
import com.volunteerhub.registrationservice.repository.UserEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserEventService {

    private final UserEventRepository userEventRepository;
    private final EventSnapshotRepository eventSnapshotRepository;
    private final EventSnapshotService eventSnapshotService;
    private final UserEventMapper userEventMapper;
    private final RegistrationPublisher registrationPublisher;

    public UserEvent findEntityByUserIdAndEventId(String userId, Long eventId) {
        return userEventRepository.findByUserIdAndEventId(userId, eventId).orElseThrow(() -> new NoSuchElementException(
                "User-event registration with user id " + userId + " and event id " + eventId + " does not exits"));
    }

    public Long getCurrentParticipantCount(Long eventId) {
        return userEventRepository.countByEventIdAndStatus(eventId, UserEventStatus.APPROVED);
    }

    public List<EventRegistrationCount> getEventsParticipantCount(List<Long> eventIds) {
        List<Object[]> participantCountRows = userEventRepository.getEventRegistrationCount(eventIds,
                List.of(UserEventStatus.APPROVED, UserEventStatus.COMPLETED));
        List<Object[]> registrationCountRows = userEventRepository.getEventRegistrationCount(eventIds,
                List.of(UserEventStatus.PENDING));
        Map<Long, EventRegistrationCount> map = new HashMap<>();
        for (Object[] row : registrationCountRows) {
            Long eventId = (Long) row[0];
            Long count = (Long) row[1];
            map.put(eventId, EventRegistrationCount.builder()
                    .eventId(eventId)
                    .registrationCount(count)
                    .participantCount(0L)
                    .build());
        }
        for (Object[] row : participantCountRows) {
            Long eventId = (Long) row[0];
            Long count = (Long) row[1];
            map.compute(eventId, (id, dto) -> {
                if (dto == null) {
                    return EventRegistrationCount.builder()
                            .eventId(eventId)
                            .registrationCount(0L)
                            .participantCount(count)
                            .build();
                } else {
                    dto.setParticipantCount(count);
                    return dto;
                }
            });
        }
        return new ArrayList<>(map.values());
    }

    public PageResponse<EventRegistrationCount> getAllEventsParticipantCount(Integer pageNum, Integer pageSize,
                                                                             LocalDateTime from, LocalDateTime to) {

        PageNumAndSizeResponse pageNumAndSizeResponse = PaginationValidation.validate(pageNum, pageSize);
        PageRequest pageRequest = PageRequest.of(
                pageNumAndSizeResponse.getPageNum(),
                pageNumAndSizeResponse.getPageSize(),
                Sort.by("eventId").descending());

        Page<Object[]> resultPage = userEventRepository.getAllEventCountsWithPagination(
                List.of(UserEventStatus.APPROVED, UserEventStatus.COMPLETED),
                from, to,
                pageRequest);

        List<EventRegistrationCount> content = resultPage.getContent().stream()
                .map(row -> EventRegistrationCount.builder()
                        .eventId((Long) row[0])
                        .participantCount(((Number) row[1]).longValue())
                        .registrationCount(((Number) row[2]).longValue())
                        .build())
                .toList();

        return PageResponse.<EventRegistrationCount>builder()
                .content(content)
                .totalElements(resultPage.getTotalElements())
                .totalPages(resultPage.getTotalPages())
                .number(resultPage.getNumber())
                .size(resultPage.getSize())
                .build();
    }
    public Page<UserEventResponse> findByUserId(String userId, UserEventStatus status, Integer pageNum,
            Integer pageSize) {
        PageNumAndSizeResponse pageNumAndSizeResponse = PaginationValidation.validate(pageNum, pageSize);
        if (status != null) {
            return userEventMapper.toResponseDtoPage(userEventRepository.findByUserIdAndStatus(userId, status,
                    PageRequest.of(pageNumAndSizeResponse.getPageNum(), pageNumAndSizeResponse.getPageSize())));
        }
        return userEventMapper.toResponseDtoPage(userEventRepository.findByUserId(userId,
                PageRequest.of(pageNumAndSizeResponse.getPageNum(), pageNumAndSizeResponse.getPageSize())));
    }

    @PreAuthorize("hasRole('MANAGER')")
    public Page<UserEventResponse> findByEventId(String userId, Long eventId, UserEventStatus status, Integer pageNum,
            Integer pageSize) {
        EventSnapshot eventSnapshot = eventSnapshotService.findEntityById(eventId);
        if (!eventSnapshot.getOwnerId().equals(userId)) {
            throw new AccessDeniedException("Insufficient permission to read registration of event with id " + eventId);
        }
        PageNumAndSizeResponse pageNumAndSizeResponse = PaginationValidation.validate(pageNum, pageSize);
        if (status != null) {
            Page<UserEvent> userEvents = userEventRepository.findByEventIdAndStatus(eventId, status, PageRequest.of(pageNumAndSizeResponse.getPageNum(), pageNumAndSizeResponse.getPageSize()));
            return userEventMapper.toResponseDtoPage(userEvents);
        }
        Page<UserEvent> userEvents = userEventRepository
                .findByEventId(eventId,
                        PageRequest.of(pageNumAndSizeResponse.getPageNum(), pageNumAndSizeResponse.getPageSize()));
        return userEventMapper.toResponseDtoPage(userEvents);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('SYSTEM') or @userEventService.canViewEventRegistrations(#userId, #eventId)")
    public Page<UserEventResponse> findAllUsers(String userId, Long eventId, Integer pageNum, Integer pageSize) {
//        EventSnapshot eventSnapshot = eventSnapshotService.findEntityById(eventId);
//        if (!eventSnapshot.getOwnerId().equals(userId) && !isParticipant(userId, eventId)) ||  {
//            throw new AccessDeniedException("Insufficient permission to read registration of event with id " + eventId);
//        }
        PageNumAndSizeResponse pageNumAndSizeResponse = PaginationValidation.validate(pageNum, pageSize);
        Page<UserEvent> userEvents = userEventRepository.findAllByEventIdAndStatuses(eventId, List.of(UserEventStatus.APPROVED, UserEventStatus.COMPLETED),
                PageRequest.of(pageNumAndSizeResponse.getPageNum(), pageNumAndSizeResponse.getPageSize()));
        return userEventMapper.toResponseDtoPage(userEvents);
    }

    public boolean canViewEventRegistrations(String userId, Long eventId) {
        EventSnapshot eventSnapshot = eventSnapshotService.findEntityById(eventId);

        if (eventSnapshot.getOwnerId().equals(userId)) return true;
        if (isParticipant(userId, eventId)) return true;

        return false;
    }

    public List<String> findUserIdsByEventId(String userId, Long eventId, Integer pageNum, Integer pageSize) {
        PageNumAndSizeResponse pageNumAndSizeResponse = PaginationValidation.validate(pageNum, pageSize);
        return userEventRepository.findAllUserIdsByEventId(eventId,
                PageRequest.of(pageNumAndSizeResponse.getPageNum(), pageNumAndSizeResponse.getPageSize()));
    }

    @PreAuthorize("hasRole('SYSTEM')")
    public List<String> findUserIdsByEventId(Long eventId) {
        return userEventRepository.findAllUserIdsByEventId(eventId);
    }

    public Boolean isParticipant(String userId, Long eventId) {
        EventSnapshot eventSnapshot = eventSnapshotService.findEntityById(eventId);
        if (userId.equals(eventSnapshot.getOwnerId())) {
            // handle owner case
            return true;
        }
        try {
            UserEvent userEvent = findEntityByUserIdAndEventId(userId, eventId);
            return userEvent.getStatus().equals(UserEventStatus.APPROVED)
                    || userEvent.getStatus().equals(UserEventStatus.COMPLETED)
                    || userId.equals(eventSnapshot.getOwnerId());
        }
        catch (NoSuchElementException e) {
            return false;
        }
    }

    public UserEventStatus getRegistrationStatus(String userId, Long eventId) {
        return userEventRepository.findByUserIdAndEventId(userId, eventId).orElseThrow(() -> new NoSuchElementException("No registration found!"))
                .getStatus();
    }

    @PreAuthorize("hasRole('SYSTEM')")
    public ChatParticipantContext getChatParticipantContext(Long eventId, String volunteerId) {
        EventSnapshot eventSnapshot = eventSnapshotService.findEntityById(eventId);
        UserEventStatus volunteerStatus = userEventRepository.findByUserIdAndEventId(volunteerId, eventId)
                .map(UserEvent::getStatus)
                .orElse(null);
        boolean hasRegistration = volunteerStatus != null;
        boolean canSend = eventSnapshot.getStatus() == EventStatus.APPROVED
                && (volunteerStatus == UserEventStatus.PENDING
                || volunteerStatus == UserEventStatus.APPROVED
                || volunteerStatus == UserEventStatus.COMPLETED);
        return ChatParticipantContext.builder()
                .eventId(eventId)
                .managerId(eventSnapshot.getOwnerId())
                .volunteerId(volunteerId)
                .eventStatus(eventSnapshot.getStatus())
                .volunteerStatus(volunteerStatus)
                .canSend(canSend)
                .canRead(hasRegistration)
                .build();
    }

    public UserEventResponse registerUserEvent(String userId, Long eventId) {
        EventSnapshot eventSnapshot = eventSnapshotService.findEntityById(eventId);
        UserEvent userEvent = UserEvent.builder()
                .userId(userId)
                .eventId(eventId)
                .eventSnapshot(eventSnapshot)
                .build();
        UserEvent savedUserEvent = userEventRepository.save(userEvent);
        registrationPublisher.publishEvent(userEventMapper.toCreatedMessage(userEvent, eventSnapshot.getOwnerId()));
        return userEventMapper.toResponseDto(savedUserEvent);
    }

    @PreAuthorize("hasRole('MANAGER')")
    public UserEventResponse reviewUserEventRegistrationRequest(String userId, String participantId, Long eventId,
            UserEventRequest request) {
        UserEvent userEvent = findEntityByUserIdAndEventId(participantId, eventId);
        EventSnapshot eventSnapshot = eventSnapshotService.findEntityById(eventId);
        if (!eventSnapshot.getOwnerId().equals(userId)) {
            throw new AccessDeniedException(
                    "Insufficient permission to review user's request to event with id " + eventId);
        }

        if (request.getStatus() == null) {
            userEvent.setNote(request.getNote());
            return userEventMapper.toResponseDto(userEventRepository.save(userEvent));
        }

        boolean validTransition =
                (userEvent.getStatus() == UserEventStatus.PENDING && (request.getStatus() == UserEventStatus.APPROVED || request.getStatus() == UserEventStatus.REJECTED))
                || (userEvent.getStatus() == UserEventStatus.APPROVED && (request.getStatus() == UserEventStatus.COMPLETED || request.getStatus() == UserEventStatus.ABSENT));
        if (!validTransition) {
            throw new IllegalArgumentException("Invalid status transition");
        }
        switch (request.getStatus()) {
            case APPROVED -> approveUserEvent(userEvent, eventSnapshot);
            case REJECTED -> rejectUserEvent(userEvent, request.getNote());
            case COMPLETED -> completeUserEvent(userEvent, request.getNote());
            case ABSENT -> absentUserEvent(userEvent, request.getNote());
            default -> throw new IllegalArgumentException("Unsupported status: " + request.getStatus());
        }
        UserEvent updatedUserEvent = userEventRepository.save(userEvent);
        switch (request.getStatus()) {
            case APPROVED -> registrationPublisher.publishEvent(userEventMapper.toApprovedMessage(updatedUserEvent));
            case REJECTED -> registrationPublisher.publishEvent(userEventMapper.toRejectedMessage(updatedUserEvent));
            case COMPLETED -> registrationPublisher.publishEvent(userEventMapper.toCompletedMessage(updatedUserEvent));
        }
        return userEventMapper.toResponseDto(updatedUserEvent);
    }

    private void approveUserEvent(UserEvent userEvent, EventSnapshot snapshot) {
        if (getCurrentParticipantCount(userEvent.getEventId()) + 1 > snapshot.getCapacity()) {
            throw new IllegalArgumentException("Event capacity reached");
        }
        userEvent.setStatus(UserEventStatus.APPROVED);
        userEvent.setReviewedAt(LocalDateTime.now());
    }

    private void rejectUserEvent(UserEvent userEvent, String note) {
        userEvent.setStatus(UserEventStatus.REJECTED);
        userEvent.setNote(note);
        userEvent.setReviewedAt(LocalDateTime.now());
    }

    private void completeUserEvent(UserEvent userEvent, String note) {
        userEvent.setStatus(UserEventStatus.COMPLETED);
        userEvent.setNote(note);
        userEvent.setCompletedAt(LocalDateTime.now());
    }

    private void absentUserEvent(UserEvent userEvent, String note) {
        userEvent.setStatus(UserEventStatus.ABSENT);
        userEvent.setNote(note);
    }

    public UserEventResponse deleteUserEventRegistrationRequest(String userId, Long eventId) {
        UserEvent userEvent = findEntityByUserIdAndEventId(userId, eventId);
        userEventRepository.delete(userEvent);
        return userEventMapper.toResponseDto(userEvent);
    }

    @PreAuthorize("hasRole('MANAGER')")
    public UserEventResponse managerDeleteUserEventRegistrationRequest(String ownerId, String userId, Long eventId) {
        EventSnapshot eventSnapshot = eventSnapshotService.findEntityById(eventId);
        if (!eventSnapshot.getOwnerId().equals(ownerId)) {
            throw new AccessDeniedException("Insufficient permission to delete user's registration");
        }
        UserEvent userEvent = findEntityByUserIdAndEventId(userId, eventId);
        userEventRepository.delete(userEvent);
        return userEventMapper.toResponseDto(userEvent);
    }

    public void deleteAllByEventId(Long eventId) {
        userEventRepository.deleteByEventId(eventId);
    }

    public List<RegistrationResponse> getRegistrationsByEventIdsInternal(
            String ownerId,
            Long eventId,
            UserEventStatus status,
            Integer pageNum,
            Integer pageSize) {
        Pageable pageable = PageRequest.of(pageNum, pageSize, Sort.by("createdAt").descending());

        Page<UserEvent> pageResult = userEventRepository.findAllByOwnerId(ownerId, eventId, status, pageable);

        return pageResult.getContent().stream()
                .map(userEventMapper::toAggregatorDto)
                .toList();
    }


    public Long getApplicationRate(String ownerId) {
        long totalApps = userEventRepository.countApplicationsByOwnerId(ownerId);
        long totalCapacity = eventSnapshotRepository.findCapacityPerManager(ownerId);

        if (totalCapacity == 0) return 0L;
        return (long) ((double) totalApps / totalCapacity * 100);
    }

    public Long getApprovalRate(String ownerId) {
        long approvedCount = userEventRepository.countApprovedByOwnerId(ownerId);
        long totalApps = userEventRepository.countApplicationsByOwnerId(ownerId);

        if (totalApps == 0) return 0L;
        return (long) ((double) approvedCount / totalApps * 100);
    }

    public List<UserEventExport> getAllForExport() {
        return userEventRepository.findAll().stream()
                .map(userEventMapper::toExportDto)
                .collect(Collectors.toList());
    }

    public List<UserEventExport> getByEventForExport(Long eventId) {
        List<UserEventStatus> validStatuses = List.of(
                UserEventStatus.APPROVED,
                UserEventStatus.COMPLETED
        );

        List<UserEvent> events = userEventRepository.findAllByEventIdAndStatus(eventId, validStatuses);

        return events.stream()
                .map(userEventMapper::toExportDto)
                .collect(Collectors.toList());
    }

    public Long countParticipatedEvents(String userId) {
        List<UserEventStatus> activeStatuses = List.of(
                UserEventStatus.APPROVED,
                UserEventStatus.COMPLETED
        );

        return userEventRepository.countUserEventsByStatuses(userId, activeStatuses);
    }

    public Map<String, Long> countStatsUserId(String userId) {
        Object[] row = (Object[]) userEventRepository.countStatsUserId(userId);

        return Map.of(
                "pending", row[0] != null ? ((Number) row[0]).longValue() : 0L,
                "approved", row[1] != null ? ((Number) row[1]).longValue() : 0L,
                "completed", row[2] != null ? ((Number) row[2]).longValue() : 0L
        );
    }

    public RegistrationAnalyticsSummary getMyAnalytics(String userId) {
        return buildAnalyticsSummary(userEventRepository.findAllByUserIdWithEventSnapshot(userId));
    }

    @PreAuthorize("hasRole('MANAGER')")
    public RegistrationAnalyticsSummary getManagerAnalytics(String ownerId) {
        return buildAnalyticsSummary(userEventRepository.findAllByOwnerIdWithEventSnapshot(ownerId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public RegistrationAnalyticsSummary getPlatformAnalytics() {
        return buildAnalyticsSummary(userEventRepository.findAllWithEventSnapshot());
    }

    private RegistrationAnalyticsSummary buildAnalyticsSummary(List<UserEvent> registrations) {
        List<UserEvent> safeRegistrations = registrations == null ? Collections.emptyList() : registrations;
        Map<String, Long> statusBreakdown = Arrays.stream(UserEventStatus.values())
                .collect(Collectors.toMap(
                        status -> status.name().toLowerCase(),
                        status -> safeRegistrations.stream()
                                .filter(registration -> registration.getStatus() == status)
                                .count(),
                        (left, right) -> left,
                        LinkedHashMap::new
                ));

        long totalApplications = safeRegistrations.size();
        long pending = statusBreakdown.getOrDefault("pending", 0L);
        long approved = statusBreakdown.getOrDefault("approved", 0L);
        long completed = statusBreakdown.getOrDefault("completed", 0L);
        long rejected = statusBreakdown.getOrDefault("rejected", 0L);
        long absent = statusBreakdown.getOrDefault("absent", 0L);
        long participated = approved + completed;
        long uniqueVolunteers = safeRegistrations.stream()
                .filter(registration -> registration.getStatus() == UserEventStatus.APPROVED
                        || registration.getStatus() == UserEventStatus.COMPLETED)
                .map(UserEvent::getUserId)
                .filter(Objects::nonNull)
                .distinct()
                .count();

        YearMonth currentMonth = YearMonth.now();
        double totalServiceHours = safeRegistrations.stream()
                .mapToDouble(this::completedServiceHours)
                .sum();
        double thisMonthServiceHours = safeRegistrations.stream()
                .filter(registration -> registration.getStatus() == UserEventStatus.COMPLETED)
                .filter(registration -> sameMonth(resolveCompletedAt(registration), currentMonth))
                .mapToDouble(this::completedServiceHours)
                .sum();
        long thisMonthCompletedEvents = safeRegistrations.stream()
                .filter(registration -> registration.getStatus() == UserEventStatus.COMPLETED)
                .filter(registration -> sameMonth(resolveCompletedAt(registration), currentMonth))
                .count();

        long acceptedOrClosed = approved + completed + absent;
        return RegistrationAnalyticsSummary.builder()
                .totalApplications(totalApplications)
                .pendingApplications(pending)
                .approvedApplications(approved)
                .completedApplications(completed)
                .rejectedApplications(rejected)
                .absentApplications(absent)
                .participatedEvents(participated)
                .uniqueVolunteers(uniqueVolunteers)
                .thisMonthCompletedEvents(thisMonthCompletedEvents)
                .totalServiceHours(roundHours(totalServiceHours))
                .thisMonthServiceHours(roundHours(thisMonthServiceHours))
                .approvalRate(percentage(approved + completed, totalApplications))
                .completionRate(percentage(completed, acceptedOrClosed))
                .statusBreakdown(statusBreakdown)
                .monthlyTrends(buildMonthlyTrends(safeRegistrations))
                .build();
    }

    private List<AnalyticsTrendPoint> buildMonthlyTrends(List<UserEvent> registrations) {
        YearMonth firstMonth = YearMonth.now().minusMonths(5);
        Map<YearMonth, TrendAccumulator> trends = new LinkedHashMap<>();
        for (int index = 0; index < 6; index++) {
            YearMonth month = firstMonth.plusMonths(index);
            trends.put(month, new TrendAccumulator(month.toString()));
        }

        for (UserEvent registration : registrations) {
            YearMonth createdMonth = toMonth(registration.getCreatedAt());
            if (trends.containsKey(createdMonth)) {
                trends.get(createdMonth).applications++;
            }

            if ((registration.getStatus() == UserEventStatus.APPROVED
                    || registration.getStatus() == UserEventStatus.COMPLETED
                    || registration.getStatus() == UserEventStatus.ABSENT)) {
                YearMonth reviewedMonth = toMonth(resolveReviewedAt(registration));
                if (trends.containsKey(reviewedMonth)) {
                    trends.get(reviewedMonth).approved++;
                }
            }

            if (registration.getStatus() == UserEventStatus.COMPLETED) {
                YearMonth completedMonth = toMonth(resolveCompletedAt(registration));
                if (trends.containsKey(completedMonth)) {
                    TrendAccumulator accumulator = trends.get(completedMonth);
                    accumulator.completed++;
                    accumulator.serviceHours += completedServiceHours(registration);
                }
            }
        }

        return trends.values().stream()
                .map(accumulator -> AnalyticsTrendPoint.builder()
                        .month(accumulator.month)
                        .applications(accumulator.applications)
                        .approved(accumulator.approved)
                        .completed(accumulator.completed)
                        .serviceHours(roundHours(accumulator.serviceHours))
                        .build())
                .toList();
    }

    private double completedServiceHours(UserEvent registration) {
        if (registration == null || registration.getStatus() != UserEventStatus.COMPLETED
                || registration.getEventSnapshot() == null
                || registration.getEventSnapshot().getStartTime() == null
                || registration.getEventSnapshot().getEndTime() == null) {
            return 0D;
        }

        long minutes = Duration.between(
                registration.getEventSnapshot().getStartTime(),
                registration.getEventSnapshot().getEndTime()
        ).toMinutes();
        if (minutes <= 0) {
            return 0D;
        }
        return minutes / 60D;
    }

    private LocalDateTime resolveCompletedAt(UserEvent registration) {
        if (registration.getCompletedAt() != null) {
            return registration.getCompletedAt();
        }
        if (registration.getUpdatedAt() != null) {
            return registration.getUpdatedAt();
        }
        return registration.getCreatedAt();
    }

    private LocalDateTime resolveReviewedAt(UserEvent registration) {
        if (registration.getReviewedAt() != null) {
            return registration.getReviewedAt();
        }
        if (registration.getUpdatedAt() != null) {
            return registration.getUpdatedAt();
        }
        return registration.getCreatedAt();
    }

    private boolean sameMonth(LocalDateTime dateTime, YearMonth month) {
        return dateTime != null && YearMonth.from(dateTime).equals(month);
    }

    private YearMonth toMonth(LocalDateTime dateTime) {
        return dateTime == null ? null : YearMonth.from(dateTime);
    }

    private Long percentage(long part, long total) {
        if (total <= 0) {
            return 0L;
        }
        return Math.round((part * 100D) / total);
    }

    private Double roundHours(double hours) {
        return Math.round(hours * 10D) / 10D;
    }

    private static class TrendAccumulator {
        private final String month;
        private long applications;
        private long approved;
        private long completed;
        private double serviceHours;

        private TrendAccumulator(String month) {
            this.month = month;
        }
    }
}
