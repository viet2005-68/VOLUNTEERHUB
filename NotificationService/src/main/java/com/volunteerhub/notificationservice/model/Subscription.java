package com.volunteerhub.notificationservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "subscriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private String userId;

    @Column(nullable = false, unique = true, length = 2048)
    private String endpoint;

    @Embedded
    private Keys keys;

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Keys {
        @Column(name = "p256dh")
        private String p256dh;

        @Column(name = "auth")
        private String auth;
    }
}