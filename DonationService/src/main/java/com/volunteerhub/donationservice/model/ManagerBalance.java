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
        @Index(name = "idx_manager_balance_manager_id", columnList = "manager_id", unique = true)
})
public class ManagerBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "manager_id", nullable = false, unique = true)
    private String managerId;

    @Builder.Default
    @Column(name = "total_received_vnd", nullable = false)
    private Long totalReceivedVnd = 0L;

    @Builder.Default
    @Column(name = "pending_payout_vnd", nullable = false)
    private Long pendingPayoutVnd = 0L;

    @Builder.Default
    @Column(name = "paid_out_vnd", nullable = false)
    private Long paidOutVnd = 0L;

    @Version
    private Long version;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Long availableVnd() {
        return totalReceivedVnd - pendingPayoutVnd - paidOutVnd;
    }
}
