package com.volunteerhub.apigateway.client;

import com.volunteerhub.apigateway.config.FeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "USERSERVICE", path = "/api/v1/users/system", configuration = FeignConfig.class)
public interface UserClient {

    @GetMapping("/{userId}")
    String findUserStatus(@PathVariable String userId);
}
