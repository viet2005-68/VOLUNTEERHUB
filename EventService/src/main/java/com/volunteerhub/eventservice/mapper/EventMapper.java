package com.volunteerhub.eventservice.mapper;

import com.volunteerhub.common.dto.EventResponse;
import com.volunteerhub.common.dto.message.event.*;
import com.volunteerhub.eventservice.model.Event;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class EventMapper {

    private final AddressMapper addressMapper;
    private final CategoryMapper categoryMapper;

    public EventResponse toDto(Event event) {
        return EventResponse.builder()
                .id(event.getId())
                .name(event.getName())
                .description(event.getDescription())
                .imageUrl(event.getImageUrl())
                .category(categoryMapper.toDto(event.getCategory()))
                .address(addressMapper.toDto(event.getAddress()))
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .registrationDeadline(event.getRegistrationDeadline())
                .capacity(event.getCapacity())
                .status(event.getStatus())
                .ownerId(event.getOwnerId())
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .approvedBy(event.getApprovedBy())
                .optional(event.getOptional())
                .build();
    }

    public Page<EventResponse> toDtoPage(Page<Event> events) {
        List<EventResponse> dtoList = events.getContent().stream()
                .map(this::toDto)
                .toList();
        return new PageImpl<>(
                dtoList,
                events.getPageable(),
                events.getTotalElements()
        );
    }

    public EventCreatedMessage toCreatedMessage(Event event) {
        return EventCreatedMessage.builder()
                .id(event.getId())
                .name(event.getName())
                .category(categoryMapper.toDto(event.getCategory()))
                .ownerId(event.getOwnerId())
                .status(event.getStatus())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .build();
    }

    public EventApprovedMessage toApprovedMessage(Event event) {
        return EventApprovedMessage.builder()
                .eventId(event.getId())
                .eventName(event.getName())
                .category(categoryMapper.toDto(event.getCategory()))
                .capacity(event.getCapacity())
                .ownerId(event.getOwnerId())
                .approvedBy(event.getApprovedBy())
                .status(event.getStatus())
                .build();
    }

    public EventRejectedMessage toRejectedMessage(Event event, String reason) {
        return EventRejectedMessage.builder()
                .eventId(event.getId())
                .eventName(event.getName())
                .category(categoryMapper.toDto(event.getCategory()))
                .ownerId(event.getOwnerId())
                .approvedBy(event.getApprovedBy())
                .status(event.getStatus())
                .reason(reason)
                .build();
    }

    public EventUpdatedMessage toUpdatedMessage(Event event, Map<String, Object> updatedFields) {
        return EventUpdatedMessage.builder()
                .id(event.getId())
                .ownerId(event.getOwnerId())
                .updatedAt(event.getUpdatedAt())
                .updatedFields(updatedFields)
                .build();
    }

    public EventDeletedMessage toDeletedMessage(Event event) {
        return EventDeletedMessage.builder()
                .eventId(event.getId())
                .name(event.getName())
                .ownerId(event.getOwnerId())
                .build();
    }
}
