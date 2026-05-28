package com.volunteerhub.registrationservice.mapper;

import com.volunteerhub.common.dto.RegistrationResponse;
import com.volunteerhub.common.dto.UserEventResponse;
import com.volunteerhub.common.dto.message.registration.RegistrationApprovedMessage;
import com.volunteerhub.common.dto.message.registration.RegistrationCompletedMessage;
import com.volunteerhub.common.dto.message.registration.RegistrationCreatedMessage;
import com.volunteerhub.common.dto.message.registration.RegistrationRejectedMessage;
import com.volunteerhub.registrationservice.dto.UserEventExport;
import com.volunteerhub.common.dto.UserEventResponse;
import com.volunteerhub.registrationservice.model.UserEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class UserEventMapper {

    public UserEventResponse toResponseDto(UserEvent userEvent) {
        return UserEventResponse.builder()
                .id(userEvent.getId())
                .userId(userEvent.getUserId())
                .eventId(userEvent.getEventId())
                .status(userEvent.getStatus())
                .note(userEvent.getNote())
                .source(userEvent.getSource())
                .qrCodeId(userEvent.getQrCodeId())
                .completedByQrCodeId(userEvent.getCompletedByQrCodeId())
                .reviewedAt(userEvent.getReviewedAt())
                .completedAt(userEvent.getCompletedAt())
                .createdAt(userEvent.getCreatedAt())
                .updatedAt(userEvent.getUpdatedAt())
                .build();
    }

    public Page<UserEventResponse> toResponseDtoPage(Page<UserEvent> userEventPage) {
        List<UserEventResponse> dtoList = userEventPage
                .getContent()
                .stream().map(this::toResponseDto)
                .toList();
        return new PageImpl<>(
                dtoList,
                userEventPage.getPageable(),
                userEventPage.getTotalElements()
        );
    }

    public RegistrationCreatedMessage toCreatedMessage(UserEvent userEvent, String eventOwnerId) {
        return RegistrationCreatedMessage.builder()
                .registrationId(userEvent.getId())
                .userId(userEvent.getUserId())
                .eventId(userEvent.getEventId())
                .imageUrl(eventImageUrl(userEvent))
                .eventOwnerId(eventOwnerId)
                .status(userEvent.getStatus())
                .createdAt(userEvent.getCreatedAt())
                .build();
    }

    public RegistrationApprovedMessage toApprovedMessage(UserEvent userEvent) {
        return RegistrationApprovedMessage.builder()
                .registrationId(userEvent.getId())
                .userId(userEvent.getUserId())
                .eventId(userEvent.getEventId())
                .imageUrl(eventImageUrl(userEvent))
                .status(userEvent.getStatus())
                .reviewedAt(userEvent.getReviewedAt())
                .build();
    }

    public RegistrationRejectedMessage toRejectedMessage(UserEvent userEvent) {
        return RegistrationRejectedMessage.builder()
                .registrationId(userEvent.getId())
                .userId(userEvent.getUserId())
                .eventId(userEvent.getEventId())
                .imageUrl(eventImageUrl(userEvent))
                .status(userEvent.getStatus())
                .note(userEvent.getNote())
                .reviewedAt(userEvent.getReviewedAt())
                .build();
    }

    public RegistrationCompletedMessage toCompletedMessage(UserEvent userEvent) {
        return RegistrationCompletedMessage.builder()
                .registrationId(userEvent.getId())
                .eventId(userEvent.getEventId())
                .imageUrl(eventImageUrl(userEvent))
                .userId(userEvent.getUserId())
                .status(userEvent.getStatus())
                .note(userEvent.getNote())
                .completedAt(userEvent.getCompletedAt())
                .completionBadgeId(userEvent.getEventSnapshot() == null
                        ? null
                        : userEvent.getEventSnapshot().getCompletionBadgeId())
                .build();
    }

    private String eventImageUrl(UserEvent userEvent) {
        return userEvent.getEventSnapshot() == null ? null : userEvent.getEventSnapshot().getImageUrl();
    }

    public RegistrationResponse toAggregatorDto(UserEvent userEvent) {
        if (userEvent == null) return null;

        return RegistrationResponse.builder()
                .id(userEvent.getId())
                .userId(userEvent.getUserId())
                .eventId(userEvent.getEventId())
                .status(userEvent.getStatus())
                .createdAt(userEvent.getCreatedAt())
                .updatedAt(userEvent.getUpdatedAt())
                .build();
    }

    public UserEventExport toExportDto(UserEvent userEvent) {
        return UserEventExport.builder()
                .id(userEvent.getId())
                .eventId(userEvent.getEventId())
                .userId(userEvent.getUserId())

                .status(userEvent.getStatus().name())

                .note(userEvent.getNote() != null ? userEvent.getNote() : "")

                .registeredAt(userEvent.getCreatedAt().toString())
                .build();
    }
}
