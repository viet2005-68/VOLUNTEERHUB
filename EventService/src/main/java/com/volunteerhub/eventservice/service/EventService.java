package com.volunteerhub.eventservice.service;

import com.volunteerhub.common.dto.EventResponse;
import com.volunteerhub.common.dto.EventResponseCSV;
import com.volunteerhub.common.utils.PageNumAndSizeResponse;
import com.volunteerhub.common.utils.PaginationValidation;
import com.volunteerhub.eventservice.dto.request.EventRequest;
import com.volunteerhub.eventservice.dto.request.RejectRequest;
import com.volunteerhub.eventservice.mapper.EventMapper;
import com.volunteerhub.eventservice.model.Address;
import com.volunteerhub.eventservice.model.Category;
import com.volunteerhub.eventservice.model.Event;
import com.volunteerhub.eventservice.publisher.EventPublisher;
import com.volunteerhub.eventservice.repository.EventRepository;
import com.volunteerhub.common.enums.EventStatus;
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
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

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
                .map(eventMapper::toDto)
                .toList();
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
            updatedFields.put("category", eventRequest.getCategoryName());
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
        Event savedEvent = eventRepository.save(event);
        eventPublisher.publishEvent(eventMapper.toUpdatedMessage(savedEvent, updatedFields));
        return eventMapper.toDto(savedEvent);
    }

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

    public Page<EventResponse> searchByKeyword(String keyword, String ownerId, EventStatus status, Integer pageNum,
                                               Integer pageSize) {
        PageNumAndSizeResponse pageNumAndSizeResponse = PaginationValidation.validate(pageNum, pageSize);
        int page = pageNumAndSizeResponse.getPageNum();
        int size = pageNumAndSizeResponse.getPageSize();

        if (ownerId == null && status == null) {
            Page<Event> events = eventRepository.searchEventsByRegex(keyword.trim(), PageRequest.of(page, size));
            return eventMapper.toDtoPage(events);
        }

        if (status != null && ownerId == null) {
            Page<Event> events = eventRepository.searchEventsByRegexAndStatus(keyword.trim(), status.name(),
                    PageRequest.of(page, size));
            return eventMapper.toDtoPage(events);
        }

        if (status == null) {
            Page<Event> events = eventRepository.searchEventsByRegexAndOwnerId(keyword.trim(), ownerId,
                    PageRequest.of(page, size));
            return eventMapper.toDtoPage(events);
        }

        Page<Event> events = eventRepository.searchEventsByRegexAndOwnerIdAndStatus(keyword.trim(), ownerId,
                status.name(), PageRequest.of(page, size));
        return eventMapper.toDtoPage(events);
    }

    public Long countEvents() {
        return eventRepository.countEvents();
    }

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

    public Long countActiveEventsByOwnerId(String ownerId) {
        return eventRepository.countByOwnerIdAndStatus(ownerId, EventStatus.APPROVED);
    }
}
