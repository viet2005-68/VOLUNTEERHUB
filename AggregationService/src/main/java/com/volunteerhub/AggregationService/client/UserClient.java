package com.volunteerhub.AggregationService.client;

import com.volunteerhub.AggregationService.config.FeignConfig;
import com.volunteerhub.common.dto.PageResponse;
import com.volunteerhub.common.dto.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "USERSERVICE", path = "/api/v1/users", configuration = FeignConfig.class)
public interface UserClient {

    @GetMapping("/admin/users/all")
    List<UserResponse> findAll(@RequestParam(defaultValue = "0") int pageNum,
                               @RequestParam(defaultValue = "10") int pageSize);

    @GetMapping("/users/{userId}")
    UserResponse findById(@PathVariable String userId);

    @GetMapping("/users/by-ids")
    List<UserResponse> findAllByIds(@RequestParam List<String> userIds);
}
