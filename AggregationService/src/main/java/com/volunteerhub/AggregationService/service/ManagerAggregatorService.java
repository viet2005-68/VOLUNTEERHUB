package com.volunteerhub.AggregationService.service;

import com.volunteerhub.AggregationService.client.EventClient;
import com.volunteerhub.AggregationService.client.RegistrationClient;
import com.volunteerhub.AggregationService.client.UserClient;
import com.volunteerhub.AggregationService.dto.ManagerRegistrationResponse;
import com.volunteerhub.common.dto.AddressResponse;
import com.volunteerhub.common.dto.EventResponse;
import com.volunteerhub.common.dto.RegistrationResponse;
import com.volunteerhub.common.dto.UserResponse;
import com.volunteerhub.common.enums.UserEventStatus;
import com.volunteerhub.common.utils.ExportUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ManagerAggregatorService {

    private final EventClient eventClient;
    private final RegistrationClient registrationClient;
    private final UserClient userClient;

    public List<ManagerRegistrationResponse> getManagerRegistrations(Long filterEventId, UserEventStatus status, Integer pageNum, Integer pageSize) {

        List<RegistrationResponse> regList = registrationClient.getRegistrationsByOwnerId(
                filterEventId, status, pageNum, pageSize
        );

        if (regList == null || regList.isEmpty()) {
            return Collections.emptyList();
        }

        // ... (Phần logic enrich dữ liệu giữ nguyên) ...
        List<Long> eventIdsToFetch = regList.stream().map(RegistrationResponse::getEventId).distinct().toList();
        List<String> userIds = regList.stream().map(RegistrationResponse::getUserId).distinct().toList();

        List<UserResponse> users = userClient.findAllByIds(userIds);
        List<EventResponse> events = eventClient.getAllEventsByIds(eventIdsToFetch);

        Map<String, UserResponse> userMap = users.stream().collect(Collectors.toMap(UserResponse::getId, Function.identity()));
        Map<Long, String> eventNameMap = events.stream().collect(Collectors.toMap(EventResponse::getId, EventResponse::getName));

        return enrichRegistrations(regList, eventNameMap, userMap);
    }

    private List<ManagerRegistrationResponse> enrichRegistrations(List<RegistrationResponse> registrations, Map<Long, String> eventNameMap, Map<String, UserResponse> userMap) {

        return registrations.stream()
                .map(reg -> {
                    UserResponse user = userMap.getOrDefault(reg.getUserId(), UserResponse.builder().build());
                    String eventName = eventNameMap.getOrDefault(reg.getEventId(), "Unknown Event");

                    return ManagerRegistrationResponse.builder()
                            .userDetails(user)
                            .eventName(eventName)
                            .eventId(reg.getEventId())
                            .registrationId(reg.getId())
                            .status(reg.getStatus())
                            .registeredAt(reg.getCreatedAt())
                            .build();
                })
                .toList();
    }

        public byte[] exportAllUsers(String format) {
            List<UserResponse> users = userClient.findAll(0,1000);

            if (users == null || users.isEmpty()) return new byte[0];

            if ("json".equalsIgnoreCase(format)) {
                return ExportUtils.toJson(users);
            }

            String[] headers = {
                    "User ID", "Họ Tên", "Username", "Email", "Số Điện Thoại",
                    "Vai Trò", "Trạng Thái", "Ngày Tham Gia", "Địa Chỉ", "Kỹ Năng"
            };

        return ExportUtils.toCsv(headers, users, u -> new Object[] {
                u.getId(),
                u.getFullName(),
                u.getUsername(),
                u.getEmail(),
                u.getPhoneNumber() != null ? u.getPhoneNumber() : "",
                u.getRole(),
                u.getStatus(),
                u.getCreatedAt(),
                formatAddress(u.getAddress()),
                u.getSkills() != null ? String.join("; ", u.getSkills()) : ""
        });
    }

    private String formatAddress(AddressResponse addr) {
        if (addr == null) return "N/A";
        return String.format("%s, %s, %s",
                addr.getStreet() != null ? addr.getStreet() : "",
                addr.getDistrict() != null ? addr.getDistrict() : "",
                addr.getProvince() != null ? addr.getProvince() : "");
    }
}