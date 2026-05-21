package com.volunteerhub.userservice.controller;

import com.volunteerhub.common.enums.UserRole;
import com.volunteerhub.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users/system")
@RequiredArgsConstructor
public class SystemController {

    private final UserService userService;

    @GetMapping("/user-ids")
    public List<String> findAllUserIds(@RequestParam(required = true) UserRole role) {
        return userService.findAllIds(role);
    }

    @GetMapping("/{userId}")
    public String findUserStatus(@PathVariable String userId) {
        return userService.getUserStatus(userId).toString();
    }

}
