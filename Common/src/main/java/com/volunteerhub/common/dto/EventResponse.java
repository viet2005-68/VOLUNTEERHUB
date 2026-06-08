package com.volunteerhub.common.dto;

import com.volunteerhub.common.enums.EventStatus;
import com.volunteerhub.common.enums.QrJoinPolicy;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EventResponse {

    private Long id;

    private String name;

    private String description;

    private String imageUrl;

    private CategoryResponse category;

    private AddressResponse address;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private LocalDateTime registrationDeadline;

    private int capacity;

    private String ownerId;

    private EventStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String approvedBy;

    private String optional;

    private QrJoinPolicy qrJoinPolicy;

    private Long completionBadgeId;
}
