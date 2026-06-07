package com.volunteerhub.donationservice.service;

import com.volunteerhub.donationservice.config.VnpayProperties;
import com.volunteerhub.donationservice.dto.CreateVnpayDonationRequest;
import com.volunteerhub.donationservice.dto.CreateVnpayDonationResponse;
import com.volunteerhub.donationservice.dto.VnpayCallbackResponse;
import com.volunteerhub.donationservice.model.Donation;
import com.volunteerhub.donationservice.model.DonationStatus;
import com.volunteerhub.donationservice.repository.DonationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.TreeMap;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VnpayService {

    public static final String PROVIDER = "VNPAY";
    private static final DateTimeFormatter VNPAY_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final VnpayProperties properties;
    private final DonationRepository donationRepository;
    private final DonationService donationService;

    @Transactional
    public CreateVnpayDonationResponse createPaymentUrl(String donorId,
                                                        String clientIp,
                                                        CreateVnpayDonationRequest request) {
        ensureConfigured();
        Donation donation = donationRepository.findByDonorIdAndClientDonationId(donorId, request.getClientDonationId())
                .orElseGet(() -> donationRepository.save(Donation.builder()
                        .donorId(donorId)
                        .managerId(request.getManagerId())
                        .clientDonationId(request.getClientDonationId())
                        .amountVnd(request.getAmountVnd())
                        .provider(PROVIDER)
                        .providerOrderId(newOrderId())
                        .status(DonationStatus.PENDING)
                        .message(trimToNull(request.getMessage()))
                        .build()));

        if (!PROVIDER.equals(donation.getProvider())) {
            throw new IllegalArgumentException("clientDonationId was already used with another payment provider.");
        }
        if (donation.getStatus() == DonationStatus.SUCCEEDED) {
            return toCreateResponse(donation, null);
        }
        if (donation.getStatus() != DonationStatus.PENDING) {
            throw new IllegalStateException("Only pending VNPay donations can create a new payment URL.");
        }

        return toCreateResponse(donation, buildPaymentUrl(donation, clientIp, request.getBankCode()));
    }

    @Transactional
    public VnpayCallbackResponse handleIpn(Map<String, String> params) {
        if (!isValidSignature(params)) {
            return new VnpayCallbackResponse("97", "Invalid signature");
        }

        String orderId = params.get("vnp_TxnRef");
        Donation donation = donationRepository.findByProviderAndProviderOrderId(PROVIDER, orderId)
                .orElse(null);
        if (donation == null) {
            return new VnpayCallbackResponse("01", "Order not found");
        }

        long amountVnd = parseVnpayAmount(params.get("vnp_Amount"));
        if (!donation.getAmountVnd().equals(amountVnd)) {
            return new VnpayCallbackResponse("04", "Invalid amount");
        }
        if (donation.getStatus() == DonationStatus.SUCCEEDED) {
            return new VnpayCallbackResponse("02", "Order already confirmed");
        }

        boolean paymentSucceeded = "00".equals(params.get("vnp_ResponseCode"))
                && "00".equals(params.get("vnp_TransactionStatus"));
        if (paymentSucceeded) {
            donationService.markProviderDonationSucceeded(PROVIDER, orderId, params.get("vnp_TransactionNo"));
        } else {
            donationService.markProviderDonationFailed(PROVIDER, orderId);
        }
        return new VnpayCallbackResponse("00", "Confirm success");
    }

    @Transactional(readOnly = true)
    public DonationStatus getReturnStatus(Map<String, String> params) {
        if (!isValidSignature(params)) {
            throw new IllegalArgumentException("Invalid VNPay return signature.");
        }
        Donation donation = donationRepository.findByProviderAndProviderOrderId(PROVIDER, params.get("vnp_TxnRef"))
                .orElseThrow(() -> new NoSuchElementException("Donation order does not exist."));
        return donation.getStatus();
    }

    private String buildPaymentUrl(Donation donation, String clientIp, String bankCode) {
        LocalDateTime now = LocalDateTime.now(VIETNAM_ZONE);
        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", properties.getTmnCode());
        params.put("vnp_Amount", String.valueOf(donation.getAmountVnd() * 100));
        params.put("vnp_CreateDate", VNPAY_DATE_FORMAT.format(now));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_IpAddr", StringUtils.hasText(clientIp) ? clientIp : "127.0.0.1");
        params.put("vnp_Locale", "vn");
        params.put("vnp_OrderInfo", "Donate " + donation.getProviderOrderId());
        params.put("vnp_OrderType", "other");
        params.put("vnp_ReturnUrl", properties.getReturnUrl());
        params.put("vnp_TxnRef", donation.getProviderOrderId());
        params.put("vnp_ExpireDate", VNPAY_DATE_FORMAT.format(now.plusMinutes(15)));
        if (StringUtils.hasText(bankCode)) {
            params.put("vnp_BankCode", bankCode);
        }

        String hashData = toQueryString(params);
        String secureHash = hmacSha512(properties.getHashSecret(), hashData);
        return properties.getPaymentUrl() + "?" + hashData + "&vnp_SecureHash=" + secureHash;
    }

    private boolean isValidSignature(Map<String, String> params) {
        ensureConfigured();
        String secureHash = params.get("vnp_SecureHash");
        if (!StringUtils.hasText(secureHash)) {
            return false;
        }
        Map<String, String> signedParams = new TreeMap<>();
        params.forEach((key, value) -> {
            if (StringUtils.hasText(value)
                    && !"vnp_SecureHash".equals(key)
                    && !"vnp_SecureHashType".equals(key)) {
                signedParams.put(key, value);
            }
        });
        String expectedHash = hmacSha512(properties.getHashSecret(), toQueryString(signedParams));
        return expectedHash.equalsIgnoreCase(secureHash);
    }

    private String toQueryString(Map<String, String> params) {
        return params.entrySet().stream()
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .reduce((left, right) -> left + "&" + right)
                .orElse("");
    }

    private String hmacSha512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder(bytes.length * 2);
            for (byte item : bytes) {
                hash.append(String.format("%02x", item));
            }
            return hash.toString();
        } catch (Exception ex) {
            throw new IllegalStateException("Could not sign VNPay request.", ex);
        }
    }

    private long parseVnpayAmount(String amount) {
        if (!StringUtils.hasText(amount)) {
            return 0;
        }
        return Long.parseLong(amount) / 100;
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private CreateVnpayDonationResponse toCreateResponse(Donation donation, String paymentUrl) {
        return CreateVnpayDonationResponse.builder()
                .donationId(donation.getId())
                .orderId(donation.getProviderOrderId())
                .amountVnd(donation.getAmountVnd())
                .status(donation.getStatus())
                .paymentUrl(paymentUrl)
                .build();
    }

    private String newOrderId() {
        return "D" + System.currentTimeMillis() + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }

    private void ensureConfigured() {
        if (!StringUtils.hasText(properties.getPaymentUrl())
                || !StringUtils.hasText(properties.getTmnCode())
                || !StringUtils.hasText(properties.getHashSecret())
                || !StringUtils.hasText(properties.getReturnUrl())) {
            throw new IllegalStateException("VNPay is not configured. Set VNPAY_TMN_CODE, VNPAY_HASH_SECRET, VNPAY_PAYMENT_URL, and VNPAY_RETURN_URL.");
        }
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
