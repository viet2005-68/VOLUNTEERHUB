package com.volunteerhub.communityservice.service;

import com.volunteerhub.communityservice.client.RegistrationClient;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EventRegistrationService {

    private final RegistrationClient registrationClient;

    public boolean isParticipant(Long eventId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(auth -> auth.replaceFirst("^ROLE_", ""))
                .findFirst()
                .orElse("");

        return Boolean.TRUE.equals(
                registrationClient.checkIsParticipant(eventId, authentication.getName(), role)
        );
    }
}
