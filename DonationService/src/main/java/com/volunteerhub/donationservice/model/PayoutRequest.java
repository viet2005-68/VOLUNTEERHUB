package com.volunteerhub.donationservice.model;

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
@Table(indexes = {
        @Index(name = "idx_payout_request_manager_id", columnList = "manager_id"),
        @Index(name = "idx_payout_request_status", columnList = "status")
})
public class PayoutRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "manager_id", nullable = false)
    private String managerId;

    @Column(name = "amount_vnd", nullable = false)
    private Long amountVnd;

    @Column(name = "momo_wallet_phone", nullable = false, length = 20)
    private String momoWalletPhone;

    @Column(name = "wallet_holder_name", nullable = false, length = 120)
    private String walletHolderName;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PayoutStatus status = PayoutStatus.PENDING;

    @Column(length = 500)
    private String note;

    @Column(name = "admin_note", length = 500)
    private String adminNote;

    @Column(name = "provider_reference")
    private String providerReference;

    @Column(name = "reviewed_by")
    private String reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
