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
@Table(
        indexes = {
                @Index(name = "idx_donation_manager_id", columnList = "manager_id"),
                @Index(name = "idx_donation_donor_id", columnList = "donor_id"),
                @Index(name = "idx_donation_status", columnList = "status")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_donation_donor_client", columnNames = {"donor_id", "client_donation_id"}),
                @UniqueConstraint(name = "uk_donation_provider_transaction", columnNames = {"provider_transaction_id"})
        }
)
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "donor_id", nullable = false)
    private String donorId;

    @Column(name = "manager_id", nullable = false)
    private String managerId;

    @Column(name = "client_donation_id", nullable = false)
    private String clientDonationId;

    @Column(name = "amount_vnd", nullable = false)
    private Long amountVnd;

    @Column(nullable = false)
    private String provider;

    @Column(name = "provider_transaction_id")
    private String providerTransactionId;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DonationStatus status = DonationStatus.PENDING;

    @Column(length = 500)
    private String message;

    @Column(name = "settled_at")
    private LocalDateTime settledAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
