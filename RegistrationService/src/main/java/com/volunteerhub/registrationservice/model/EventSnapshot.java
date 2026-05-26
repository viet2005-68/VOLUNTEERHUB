package com.volunteerhub.registrationservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.volunteerhub.common.enums.EventStatus;
import com.volunteerhub.common.enums.QrJoinPolicy;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventSnapshot {

    @Id
    private Long eventId;

    @Column(nullable = false)
    private int capacity;

    @Column(nullable = false)
    private EventStatus status;

    @Column(name = "owner_id", nullable = false)
    private String ownerId;

    @Column(name = "event_name")
    private String eventName;

    @Column(name = "start_time")
    private java.time.LocalDateTime startTime;

    @Column(name = "end_time")
    private java.time.LocalDateTime endTime;

    @Column(name = "registration_deadline")
    private java.time.LocalDateTime registrationDeadline;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "qr_join_policy", nullable = false)
    private QrJoinPolicy qrJoinPolicy = QrJoinPolicy.REQUIRE_APPROVAL;

    @Version
    private Long version;

    @Builder.Default
    @OneToMany(mappedBy = "eventSnapshot", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<UserEvent> userEvents = new ArrayList<>();
}
