package com.volunteerhub.notificationservice.dto.request;

import com.volunteerhub.common.enums.PushChannel;
import lombok.Data;

@Data
public class DeviceTokenRequest {

    private PushChannel channel = PushChannel.FCM;
    private String token;
    private String platform;
}
