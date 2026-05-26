package com.volunteerhub.notificationservice.model;

import com.volunteerhub.common.enums.PushChannel;
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
                @Index(name = "idx_device_token_user_id", columnList = "user_id")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_device_token_token", columnNames = "token")
        }
)
public class DeviceToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PushChannel channel = PushChannel.FCM;

    @Column(nullable = false, length = 2048)
    private String token;

    private String platform;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
