package com.volunteerhub.eventservice.service;

import com.volunteerhub.common.dto.EventResponse;
import com.volunteerhub.common.dto.EventResponseCSV;
import com.volunteerhub.common.utils.PageNumAndSizeResponse;
import com.volunteerhub.common.utils.PaginationValidation;
import com.volunteerhub.eventservice.dto.request.EventRequest;
import com.volunteerhub.eventservice.dto.request.RejectRequest;
import com.volunteerhub.eventservice.dto.response.EventAnalyticsSummaryResponse;
import com.volunteerhub.eventservice.dto.response.EventCategoryDistributionResponse;
import com.volunteerhub.eventservice.dto.response.EventMonthlyCreationAnalyticsResponse;
import com.volunteerhub.eventservice.mapper.EventMapper;
import com.volunteerhub.eventservice.model.Address;
import com.volunteerhub.eventservice.model.Category;
import com.volunteerhub.eventservice.model.Event;
import com.volunteerhub.eventservice.publisher.EventPublisher;
import com.volunteerhub.eventservice.repository.EventRepository;
import com.volunteerhub.common.enums.EventStatus;
import com.volunteerhub.common.enums.QrJoinPolicy;
import com.volunteerhub.eventservice.specification.EventSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {
    private static final Long DEFAULT_COMPLETION_BADGE_ID = 8L;
    private static final Long EDUCATION_BADGE_ID = 2L;
    private static final Long ENVIRONMENT_BADGE_ID = 4L;
    private static final Long ANIMAL_BADGE_ID = 11L;
    private static final Long HEALTH_BADGE_ID = 13L;

    private final EventRepository eventRepository;
    private final CategoryService categoryService;
    private final AddressService addressService;
    private final FileStorageService fileStorageService;
    private final EventMapper eventMapper;
    private final EventPublisher eventPublisher;

    public Event findEntityById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("No such event with id " + id));
    }

    public EventResponse findById(Long id) {
        return eventMapper.toDto(eventRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("No such event with id " + id)));
    }

    public List<EventResponse> findByIds(List<Long> ids) {
        return eventRepository.findByIdIn(ids).stream()
                .map(eventMapper::toDto).toList();
    }

    public Page<EventResponse> findAll(Integer pageNum, Integer pageSize, EventStatus status,
            String categoryName, LocalDateTime startAfter, LocalDateTime endBefore,
            String province, String district, String street,
            String sortedBy, String order) {
        PageNumAndSizeResponse pageNumAndSizeResponse = PaginationValidation.validate(pageNum, pageSize);
        int page = pageNumAndSizeResponse.getPageNum();
        int size = pageNumAndSizeResponse.getPageSize();

        Sort sort = order.equals("asc")
                ? Sort.by(sortedBy).ascending()
                : Sort.by(sortedBy).descending();
        Page<Event> events = eventRepository.findAll(
                EventSpecification.filterEvents(categoryName, status, startAfter, endBefore, province, district, street, null),
                PageRequest.of(page, size, sort));
        return eventMapper.toDtoPage(events);
    }

    public Page<EventResponse> findAllOwnedEvent(String userId, Integer pageNum, Integer pageSize, EventStatus status,
                                                 String categoryName, LocalDateTime startAfter, LocalDateTime endBefore,
                                                 String province, String district, String street,
                                                 String sortedBy, String order) {
        PageNumAndSizeResponse pageNumAndSizeResponse = PaginationValidation.validate(pageNum, pageSize);
        Sort sort = order.equals("asc")
                ? Sort.by(sortedBy).ascending()
                : Sort.by(sortedBy).descending();
        Page<Event> events = eventRepository
                .findAll(EventSpecification.filterEvents(categoryName, status, startAfter, endBefore, province, district, street, userId),
                         PageRequest.of(pageNumAndSizeResponse.getPageNum(), pageNumAndSizeResponse.getPageSize(), sort));

        return eventMapper.toDtoPage(events);
    }

    @PreAuthorize("hasRole('MANAGER')")
    public EventResponse createEvent(String userId, EventRequest eventRequest, MultipartFile imageFile)
            throws IOException {
        Category category = categoryService.findByNameOrCreate(eventRequest.getCategoryName());

        Address address = addressService.findOrCreateAddress(eventRequest.getAddress());

        String imageUrl = imageFile != null ? fileStorageService.uploadFile(imageFile) : null;

        Event event = Event.builder()
                .name(eventRequest.getName())
                .description(eventRequest.getDescription())
                .imageUrl(imageUrl)
                .category(category)
                .status(EventStatus.PENDING)
                .startTime(eventRequest.getStartTime())
                .endTime(eventRequest.getEndTime())
                .registrationDeadline(eventRequest.getRegistrationDeadline())
                .address(address)
                .capacity(eventRequest.getCapacity())
                .ownerId(userId)
                .optional(eventRequest.getOptional())
                .qrJoinPolicy(eventRequest.getQrJoinPolicy() == null
                        ? QrJoinPolicy.REQUIRE_APPROVAL
                        : eventRequest.getQrJoinPolicy())
                .completionBadgeId(resolveCompletionBadgeId(eventRequest.getCategoryName()))
                .build();

        Event savedEvent = eventRepository.save(event);
        savedEvent.setCategoryId(category.getId());
        savedEvent.setAddressId(address.getId());
        eventPublisher.publishEvent(eventMapper.toCreatedMessage(savedEvent));
        return eventMapper.toDto(savedEvent);
    }

    @PreAuthorize("hasRole('MANAGER')")
    public EventResponse updateEvent(String userId, Long eventId, EventRequest eventRequest, MultipartFile imageFile)
            throws IOException {
        Event event = findEntityById(eventId);

        if (!event.getOwnerId().equals(userId)) {
            throw new AccessDeniedException("Insufficient permission to modify this record.");
        }

        Map<String, Object> updatedFields = new HashMap<>();

        String imageUrl = imageFile != null ? fileStorageService.uploadFile(imageFile) : null;

        if (imageUrl != null) {
            event.setImageUrl(imageUrl);
            updatedFields.put("image_url", imageUrl);
        }

        if (eventRequest.getName() != null) {
            event.setName(eventRequest.getName());
            updatedFields.put("name", eventRequest.getName());
        }
        if (eventRequest.getDescription() != null) {
            event.setDescription(eventRequest.getDescription());
            updatedFields.put("description", eventRequest.getDescription());
        }

        if (eventRequest.getCategoryName() != null && !eventRequest.getCategoryName().isBlank()) {
            Category category = categoryService.findByNameOrCreate(eventRequest.getCategoryName());
            event.setCategory(category);
            event.setCategoryId(category.getId());
            Long completionBadgeId = resolveCompletionBadgeId(eventRequest.getCategoryName());
            event.setCompletionBadgeId(completionBadgeId);
            updatedFields.put("category", eventRequest.getCategoryName());
            updatedFields.put("completion_badge_id", completionBadgeId);
        }

        if (eventRequest.getAddress() != null && eventRequest.getAddress().getDistrict() != null &&
                eventRequest.getAddress().getProvince() != null && eventRequest.getAddress().getStreet() != null) {
            Address address = addressService.findOrCreateAddress(eventRequest.getAddress());
            event.setAddress(address);
            event.setAddressId(address.getId());
            String addressString = address.getStreet() + ", " + address.getDistrict() + ", " + address.getProvince();
            updatedFields.put("address", addressString);
        }

        if (eventRequest.getStartTime() != null) {
            event.setStartTime(eventRequest.getStartTime());
            updatedFields.put("start_time", eventRequest.getStartTime());
        }
        if (eventRequest.getEndTime() != null) {
            event.setEndTime(eventRequest.getEndTime());
            updatedFields.put("end_time", eventRequest.getEndTime());
        }
        if (eventRequest.getRegistrationDeadline() != null) {
            event.setRegistrationDeadline(eventRequest.getRegistrationDeadline());
            updatedFields.put("registration_deadline", eventRequest.getRegistrationDeadline());
        }

        if (eventRequest.getCapacity() > 0) {
            event.setCapacity(eventRequest.getCapacity());
            updatedFields.put("capacity", eventRequest.getCapacity());
        }

        if (eventRequest.getOptional() != null) {
            event.setOptional(eventRequest.getOptional());
            updatedFields.put("optional", eventRequest.getOptional());
        }
        if (eventRequest.getQrJoinPolicy() != null) {
            event.setQrJoinPolicy(eventRequest.getQrJoinPolicy());
            updatedFields.put("qr_join_policy", eventRequest.getQrJoinPolicy().name());
        }
        Event savedEvent = eventRepository.save(event);
        eventPublisher.publishEvent(eventMapper.toUpdatedMessage(savedEvent, updatedFields));
        return eventMapper.toDto(savedEvent);
    }

    // TODO: delete old images
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public EventResponse deleteEvent(String userId, Long eventId) {
        Event event = findEntityById(eventId);
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !event.getOwnerId().equals(userId)) {
            throw new AccessDeniedException("Insufficient permission to delete this record.");
        }
        eventRepository.delete(event);
        eventPublisher.publishEvent(eventMapper.toDeletedMessage(event));
        return eventMapper.toDto(event);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public EventResponse approveEvent(String userId, Long eventId) {
        Event event = findEntityById(eventId);
        if (!event.getStatus().equals(EventStatus.PENDING)) {
            throw new IllegalArgumentException("Unable to approve this event.");
        }
        event.setStatus(EventStatus.APPROVED);
        event.setApprovedBy(userId);
        eventPublisher.publishEvent(eventMapper.toApprovedMessage(event));
        return eventMapper.toDto(eventRepository.save(event));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public EventResponse rejectEvent(String userId, Long eventId, RejectRequest request) {
        Event event = findEntityById(eventId);
        if (!event.getStatus().equals(EventStatus.PENDING)) {
            throw new IllegalArgumentException("Unable to reject this event.");
        }
        event.setStatus(EventStatus.REJECTED);
        event.setApprovedBy(userId);
        eventPublisher.publishEvent(eventMapper.toRejectedMessage(event, request.getReason()));
        return eventMapper.toDto(eventRepository.save(event));
    }

    public Page<EventResponse> searchByKeyword(String keyword, String ownerId, EventStatus status, Integer pageNum, Integer pageSize) {
        PageNumAndSizeResponse pageNumAndSizeResponse = PaginationValidation.validate(pageNum, pageSize);
        int page = pageNumAndSizeResponse.getPageNum();
        int size = pageNumAndSizeResponse.getPageSize();
        if (ownerId == null && status == null) {
            Page<Event> events = eventRepository.searchEventsByRegex(keyword.trim(), PageRequest.of(page, size));
            return eventMapper.toDtoPage(events);
        }

        if (status != null && ownerId == null) {
            Page<Event> events = eventRepository.searchEventsByRegexAndStatus(keyword.trim(), status.name(), PageRequest.of(page, size));
            return eventMapper.toDtoPage(events);
        }

        if (status == null) {
            Page<Event> events = eventRepository.searchEventsByRegexAndOwnerId(keyword.trim(), ownerId, PageRequest.of(page, size));
            return eventMapper.toDtoPage(events);
        }

        Page<Event> events = eventRepository.searchEventsByRegexAndOwnerIdAndStatus(keyword.trim(), ownerId, status.name(), PageRequest.of(page, size));
        return eventMapper.toDtoPage(events);
    }

    public Long countEvents() {
        return eventRepository.countEvents();
    }

    // Trong EventService hoặc Mapper
    public EventResponseCSV convertToExportData(Event event) {
        return EventResponseCSV.builder()
                .id(event.getId())
                .name(event.getName())
                .ownerId(event.getOwnerId())
                .status(event.getStatus().name())

                .categoryName(event.getCategory() != null
                        ? event.getCategory().getName()
                        : "Uncategorized")

                .fullAddress(event.getAddress() != null
                        ? event.getAddress().getStreet() + ", " + event.getAddress().getDistrict() + ", "
                                + event.getAddress().getProvince()
                        : "Online/Unknown")

                .startTime(event.getStartTime().toString())
                .endTime(event.getEndTime().toString())

                .capacity(event.getCapacity())
                .badgeCount(event.getBadges() == null ? 0 : event.getBadges().size())

                .build();
    }

    public List<EventResponseCSV> getDataForExport() {
        List<Event> events = eventRepository.findAllForExport();

        return events.stream()
                .map(this::convertToExportData)
                .collect(Collectors.toList());
    }

    public Long countEventsByOwnerId(String ownerId) {
        return eventRepository.countEventsByOwnerId(ownerId);
    }

    public Map<String, Long> countEventsByOwnerIds(List<String> ownerIds) {
        if (ownerIds == null || ownerIds.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<String, Long> counts = ownerIds.stream()
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toMap(Function.identity(), id -> 0L, (left, right) -> left, LinkedHashMap::new));

        if (counts.isEmpty()) {
            return Collections.emptyMap();
        }

        eventRepository.countEventsByOwnerIds(counts.keySet())
                .forEach(row -> counts.put((String) row[0], ((Number) row[1]).longValue()));

        return counts;
    }

    public Long countActiveEventsByOwnerId(String ownerId) {
        return eventRepository.countByOwnerIdAndStatus(ownerId, EventStatus.APPROVED);
    }

    public Map<String, Long> countEventsByStatus() {
        return normalizeStatusCounts(eventRepository.countEventsByStatus());
    }

    public Map<String, Long> countEventsByStatusByOwnerId(String ownerId) {
        return normalizeStatusCounts(eventRepository.countEventsByOwnerIdAndStatus(ownerId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<EventMonthlyCreationAnalyticsResponse> countCreatedEventsPerMonth(Integer months) {
        return buildCreatedEventsPerMonth(months);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<EventCategoryDistributionResponse> countEventsByCategory() {
        return mapCategoryDistribution(eventRepository.countEventsByCategory());
    }

    @PreAuthorize("hasRole('ADMIN')")
    public EventAnalyticsSummaryResponse getEventAnalyticsSummary() {
        Map<String, Long> statusCounts = countEventsByStatus();
        return EventAnalyticsSummaryResponse.builder()
                .totalEvents(countEvents())
                .pendingEvents(statusCounts.getOrDefault("pending", 0L))
                .approvedEvents(statusCounts.getOrDefault("approved", 0L))
                .rejectedEvents(statusCounts.getOrDefault("rejected", 0L))
                .totalCapacity(eventRepository.sumCapacity())
                .build();
    }

    private List<EventMonthlyCreationAnalyticsResponse> buildCreatedEventsPerMonth(Integer months) {
        int safeMonths = Math.min(Math.max(months == null ? 12 : months, 1), 24);
        YearMonth firstMonth = YearMonth.now().minusMonths(safeMonths - 1L);
        Map<YearMonth, EventMonthlyCreationAnalyticsResponse> monthlyCounts = new LinkedHashMap<>();

        for (int i = 0; i < safeMonths; i++) {
            YearMonth month = firstMonth.plusMonths(i);
            monthlyCounts.put(month, EventMonthlyCreationAnalyticsResponse.builder()
                    .month(month.format(DateTimeFormatter.ofPattern("yyyy-MM")))
                    .pending(0L)
                    .approved(0L)
                    .rejected(0L)
                    .total(0L)
                    .build());
        }

        List<Object[]> rows = eventRepository.countCreatedEventsByMonthAndStatus(firstMonth.atDay(1).atStartOfDay());

        rows.forEach(row -> {
            YearMonth month = YearMonth.of(((Number) row[0]).intValue(), ((Number) row[1]).intValue());
            EventMonthlyCreationAnalyticsResponse response = monthlyCounts.get(month);
            if (response == null) {
                return;
            }

            EventStatus status = (EventStatus) row[2];
            long count = ((Number) row[3]).longValue();
            switch (status) {
                case PENDING -> response.setPending(count);
                case APPROVED -> response.setApproved(count);
                case REJECTED -> response.setRejected(count);
            }
        });

        monthlyCounts.values().forEach(response ->
                response.setTotal(response.getPending() + response.getApproved() + response.getRejected()));

        return new ArrayList<>(monthlyCounts.values());
    }

    private List<EventCategoryDistributionResponse> mapCategoryDistribution(List<Object[]> rows) {
        return rows.stream()
                .map(row -> EventCategoryDistributionResponse.builder()
                        .categoryId(((Number) row[0]).longValue())
                        .categoryName((String) row[1])
                        .events(((Number) row[2]).longValue())
                        .build())
                .toList();
    }

    private Map<String, Long> normalizeStatusCounts(List<Object[]> rows) {
        Map<String, Long> counts = Arrays.stream(EventStatus.values())
                .collect(Collectors.toMap(
                        status -> status.name().toLowerCase(),
                        status -> 0L,
                        (left, right) -> left,
                        LinkedHashMap::new
                ));

        for (Object[] row : rows) {
            if (row == null || row.length < 2 || row[0] == null) {
                continue;
            }
            EventStatus status = (EventStatus) row[0];
            Long count = row[1] == null ? 0L : ((Number) row[1]).longValue();
            counts.put(status.name().toLowerCase(), count);
        }
        return counts;
    }

    private Long resolveCompletionBadgeId(String categoryName) {
        if (categoryName == null) {
            return DEFAULT_COMPLETION_BADGE_ID;
        }
        return switch (categoryName.trim().toLowerCase()) {
            case "education" -> EDUCATION_BADGE_ID;
            case "environment" -> ENVIRONMENT_BADGE_ID;
            case "animals", "animal" -> ANIMAL_BADGE_ID;
            case "health" -> HEALTH_BADGE_ID;
            default -> DEFAULT_COMPLETION_BADGE_ID;
        };
    }
}
