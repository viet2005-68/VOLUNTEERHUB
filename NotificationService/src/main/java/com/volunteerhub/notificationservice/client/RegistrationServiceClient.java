package com.volunteerhub.notificationservice.client;

import com.volunteerhub.notificationservice.config.FeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "REGISTRATIONSERVICE", configuration = FeignConfig.class)
public interface RegistrationServiceClient {

    @GetMapping("/api/v1/registrations/events/{eventId}/participant-ids")
    List<String> findAllUserIdsByEventId(@PathVariable Long eventId);
}
