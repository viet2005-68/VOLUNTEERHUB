package com.volunteerhub.registrationservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.volunteerhub.common.enums.RegistrationSource;
import com.volunteerhub.common.enums.UserEventStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(
        indexes = {
                @Index(name = "idx_user_event_event_id", columnList = "event_id"),
                @Index(name = "idx_user_event_user_id", columnList = "user_id")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_user_event_user_id_event_id", columnNames = {"user_id", "event_id"})
        })
public class UserEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    private EventSnapshot eventSnapshot;

    @Column(name = "event_id", insertable = false, updatable = false)
    private Long eventId;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserEventStatus status = UserEventStatus.PENDING;

    private String note;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RegistrationSource source = RegistrationSource.MANUAL;

    @Column(name = "qr_code_id")
    private Long qrCodeId;

    @Column(name = "completed_by_qr_code_id")
    private Long completedByQrCodeId;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
