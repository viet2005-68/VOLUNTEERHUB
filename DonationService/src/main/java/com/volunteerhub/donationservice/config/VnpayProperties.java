package com.volunteerhub.donationservice.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "vnpay")
public class VnpayProperties {
    private String paymentUrl;
    private String tmnCode;
    private String hashSecret;
    private String returnUrl;
    private String ipnUrl;
}
