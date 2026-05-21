package com.volunteerhub.communityservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "REGISTRATIONSERVICE")
public interface RegistrationClient {

    @GetMapping("/api/v1/registrations/events/{eventId}/isParticipant")
    Boolean checkIsParticipant(@PathVariable Long eventId,
                               @RequestHeader("X-USER-ID") String userId,
                               @RequestHeader("X-USER-ROLE") String role);
}
