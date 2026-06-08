package com.volunteerhub.registrationservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(
        indexes = {
                @Index(name = "idx_event_qr_code_event_id", columnList = "event_id"),
                @Index(name = "idx_event_qr_code_status", columnList = "status"),
                @Index(name = "idx_event_qr_code_purpose", columnList = "purpose")
        }
)
public class EventQrCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonIgnore
    private EventSnapshot eventSnapshot;

    @Column(name = "event_id", insertable = false, updatable = false)
    private Long eventId;

    @Column(name = "token_secret_hash", nullable = false, length = 128)
    private String tokenSecretHash;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(32) default 'JOIN'")
    private QrCodePurpose purpose = QrCodePurpose.JOIN;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QrCodeStatus status = QrCodeStatus.ACTIVE;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "max_uses")
    private Integer maxUses;

    @Column(length = 120)
    private String label;

    @Column(length = 500)
    private String note;

    @Builder.Default
    @Column(name = "use_count", nullable = false)
    private Integer useCount = 0;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @Column(name = "revoked_by")
    private String revokedBy;

    @Column(name = "revoke_reason", length = 500)
    private String revokeReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
