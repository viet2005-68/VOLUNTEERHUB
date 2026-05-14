package com.volunteerhub.vippro.NotificationService.client;

import com.volunteerhub.vippro.NotificationService.config.FeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "USERSERVICE", configuration = FeignConfig.class)
public interface UserServiceClient {

//    @GetMapping("/api/v1/users/system/user-ids")
//    List<String> findAllUserIds(@RequestParam(required = true)
//            ,UserRole role);
}