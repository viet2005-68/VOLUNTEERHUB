package com.volunteerhub.donationservice.controller;

import com.volunteerhub.donationservice.dto.CreateMockDonationRequest;
import com.volunteerhub.donationservice.dto.CreatePayoutRequest;
import com.volunteerhub.donationservice.dto.CreateVnpayDonationRequest;
import com.volunteerhub.donationservice.dto.CreateVnpayDonationResponse;
import com.volunteerhub.donationservice.dto.DonationResponse;
import com.volunteerhub.donationservice.dto.EventDonationSummaryResponse;
import com.volunteerhub.donationservice.dto.ManagerBalanceResponse;
import com.volunteerhub.donationservice.dto.PayoutRequestResponse;
import com.volunteerhub.donationservice.dto.ReviewPayoutRequest;
import com.volunteerhub.donationservice.dto.VnpayCallbackResponse;
import com.volunteerhub.donationservice.model.PayoutStatus;
import com.volunteerhub.donationservice.service.DonationService;
import com.volunteerhub.donationservice.service.PayoutService;
import com.volunteerhub.donationservice.service.VnpayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/donations")
@RequiredArgsConstructor
public class DonationController {

    private final DonationService donationService;
    private final PayoutService payoutService;
    private final VnpayService vnpayService;

    @PostMapping("/mock-success")
    public DonationResponse createSuccessfulMockDonation(@Valid @RequestBody CreateMockDonationRequest request) {
        return donationService.createSuccessfulMockDonation(currentUserId(), request);
    }

    @PostMapping("/vnpay/create")
    public CreateVnpayDonationResponse createVnpayPayment(@Valid @RequestBody CreateVnpayDonationRequest request,
                                                          HttpServletRequest servletRequest) {
        return vnpayService.createPaymentUrl(currentUserId(), clientIp(servletRequest), request);
    }

    @GetMapping("/vnpay/ipn")
    public VnpayCallbackResponse handleVnpayIpn(@RequestParam Map<String, String> params) {
        return vnpayService.handleIpn(params);
    }

    @GetMapping("/vnpay/return")
    public ResponseEntity<Void> handleVnpayReturn(@RequestParam Map<String, String> params) {
        VnpayService.VnpayReturnResult result = vnpayService.handleReturn(params);
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(vnpayService.buildMobileReturnRedirect(result)))
                .build();
    }

    @GetMapping("/me")
    public List<DonationResponse> listMyDonations() {
        return donationService.listMyDonations(currentUserId());
    }

    @GetMapping("/me/events/{eventId}/donations")
    public List<DonationResponse> listMyEventDonations(@PathVariable Long eventId) {
        return donationService.listMyEventDonations(currentUserId(), eventId);
    }

    @GetMapping("/me/events/{eventId}/summary")
    public EventDonationSummaryResponse getMyEventDonationSummary(@PathVariable Long eventId) {
        return donationService.getMyEventDonationSummary(currentUserId(), eventId);
    }

    @GetMapping("/events/{eventId}/donations")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public List<DonationResponse> listEventDonations(@PathVariable Long eventId) {
        return donationService.listEventDonations(currentUserId(), currentRole(), eventId);
    }

    @GetMapping("/events/{eventId}/summary")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public EventDonationSummaryResponse getEventDonationSummary(@PathVariable Long eventId) {
        return donationService.getEventDonationSummary(currentUserId(), currentRole(), eventId);
    }

    @GetMapping("/{donationId}")
    public DonationResponse getDonation(@PathVariable Long donationId) {
        return donationService.getDonation(currentUserId(), currentRole(), donationId);
    }

    @GetMapping("/managers/me/balance")
    @PreAuthorize("hasRole('MANAGER')")
    public ManagerBalanceResponse getMyManagerBalance() {
        return donationService.getManagerBalance(currentUserId(), currentRole(), currentUserId());
    }

    @GetMapping("/managers/{managerId}/balance")
    @PreAuthorize("hasRole('ADMIN')")
    public ManagerBalanceResponse getManagerBalance(@PathVariable String managerId) {
        return donationService.getManagerBalance(currentUserId(), currentRole(), managerId);
    }

    @GetMapping("/managers/me/donations")
    @PreAuthorize("hasRole('MANAGER')")
    public List<DonationResponse> listMyManagerDonations() {
        return donationService.listManagerDonations(currentUserId(), currentRole(), currentUserId());
    }

    @GetMapping("/managers/{managerId}/donations")
    @PreAuthorize("hasRole('ADMIN')")
    public List<DonationResponse> listManagerDonations(@PathVariable String managerId) {
        return donationService.listManagerDonations(currentUserId(), currentRole(), managerId);
    }

    @PostMapping("/managers/me/payout-requests")
    @PreAuthorize("hasRole('MANAGER')")
    public PayoutRequestResponse createPayoutRequest(@Valid @RequestBody CreatePayoutRequest request) {
        return payoutService.createPayoutRequest(currentUserId(), request);
    }

    @GetMapping("/managers/me/payout-requests")
    @PreAuthorize("hasRole('MANAGER')")
    public List<PayoutRequestResponse> listMyPayoutRequests() {
        return payoutService.listManagerPayoutRequests(currentUserId(), currentRole(), currentUserId());
    }

    @PutMapping("/managers/me/payout-requests/{payoutRequestId}/cancel")
    @PreAuthorize("hasRole('MANAGER')")
    public PayoutRequestResponse cancelPayoutRequest(@PathVariable Long payoutRequestId) {
        return payoutService.cancelPayoutRequest(currentUserId(), payoutRequestId);
    }

    @GetMapping("/admin/payout-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public List<PayoutRequestResponse> listAdminPayoutRequests(@RequestParam(required = false) PayoutStatus status) {
        return payoutService.listAdminPayoutRequests(status);
    }

    @PutMapping("/admin/payout-requests/{payoutRequestId}/complete")
    @PreAuthorize("hasRole('ADMIN')")
    public PayoutRequestResponse completePayoutRequest(@PathVariable Long payoutRequestId,
                                                       @RequestBody(required = false) ReviewPayoutRequest request) {
        return payoutService.completePayoutRequest(currentUserId(), payoutRequestId, safeReviewRequest(request));
    }

    @PutMapping("/admin/payout-requests/{payoutRequestId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public PayoutRequestResponse rejectPayoutRequest(@PathVariable Long payoutRequestId,
                                                     @RequestBody(required = false) ReviewPayoutRequest request) {
        return payoutService.rejectPayoutRequest(currentUserId(), payoutRequestId, safeReviewRequest(request));
    }

    private ReviewPayoutRequest safeReviewRequest(ReviewPayoutRequest request) {
        return request == null ? new ReviewPayoutRequest() : request;
    }

    private String currentUserId() {
        return currentAuthentication().getName();
    }

    private String currentRole() {
        return currentAuthentication().getAuthorities().stream()
                .findFirst()
                .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                .orElse("");
    }

    private Authentication currentAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
