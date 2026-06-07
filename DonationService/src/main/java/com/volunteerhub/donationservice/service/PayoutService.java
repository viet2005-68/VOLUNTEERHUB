package com.volunteerhub.donationservice.service;

import com.volunteerhub.donationservice.dto.CreatePayoutRequest;
import com.volunteerhub.donationservice.dto.PayoutRequestResponse;
import com.volunteerhub.donationservice.dto.ReviewPayoutRequest;
import com.volunteerhub.donationservice.model.ManagerBalance;
import com.volunteerhub.donationservice.model.PayoutRequest;
import com.volunteerhub.donationservice.model.PayoutStatus;
import com.volunteerhub.donationservice.repository.ManagerBalanceRepository;
import com.volunteerhub.donationservice.repository.PayoutRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class PayoutService {

    private final DonationService donationService;
    private final ManagerBalanceRepository balanceRepository;
    private final PayoutRequestRepository payoutRepository;

    @Transactional
    public PayoutRequestResponse createPayoutRequest(String managerId, CreatePayoutRequest request) {
        ManagerBalance balance = donationService.getOrCreateBalanceForUpdate(managerId);
        if (balance.availableVnd() < request.getAmountVnd()) {
            throw new IllegalArgumentException("Payout amount exceeds available balance.");
        }
        balance.setPendingPayoutVnd(balance.getPendingPayoutVnd() + request.getAmountVnd());
        balanceRepository.save(balance);

        PayoutRequest payoutRequest = PayoutRequest.builder()
                .managerId(managerId)
                .amountVnd(request.getAmountVnd())
                .momoWalletPhone(request.getMomoWalletPhone())
                .walletHolderName(request.getWalletHolderName().trim())
                .note(trimToNull(request.getNote()))
                .status(PayoutStatus.PENDING)
                .build();
        return toPayoutResponse(payoutRepository.save(payoutRequest));
    }

    @Transactional(readOnly = true)
    public List<PayoutRequestResponse> listManagerPayoutRequests(String currentUserId, String role, String managerId) {
        if (!isAdmin(role) && !currentUserId.equals(managerId)) {
            throw new AccessDeniedException("Managers can only view their own payout requests.");
        }
        return payoutRepository.findByManagerIdOrderByCreatedAtDesc(managerId).stream()
                .map(this::toPayoutResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PayoutRequestResponse> listAdminPayoutRequests(PayoutStatus status) {
        List<PayoutRequest> requests = status == null
                ? payoutRepository.findAllByOrderByCreatedAtDesc()
                : payoutRepository.findByStatusOrderByCreatedAtAsc(status);
        return requests.stream()
                .map(this::toPayoutResponse)
                .toList();
    }

    @Transactional
    public PayoutRequestResponse completePayoutRequest(String adminId, Long payoutRequestId, ReviewPayoutRequest request) {
        PayoutRequest payoutRequest = findPendingPayout(payoutRequestId);
        ManagerBalance balance = donationService.getOrCreateBalanceForUpdate(payoutRequest.getManagerId());
        balance.setPendingPayoutVnd(balance.getPendingPayoutVnd() - payoutRequest.getAmountVnd());
        balance.setPaidOutVnd(balance.getPaidOutVnd() + payoutRequest.getAmountVnd());
        balanceRepository.save(balance);

        payoutRequest.setStatus(PayoutStatus.COMPLETED);
        payoutRequest.setProviderReference(trimToNull(request.getProviderReference()));
        payoutRequest.setAdminNote(trimToNull(request.getAdminNote()));
        payoutRequest.setReviewedBy(adminId);
        payoutRequest.setReviewedAt(LocalDateTime.now());
        return toPayoutResponse(payoutRepository.save(payoutRequest));
    }

    @Transactional
    public PayoutRequestResponse rejectPayoutRequest(String adminId, Long payoutRequestId, ReviewPayoutRequest request) {
        PayoutRequest payoutRequest = findPendingPayout(payoutRequestId);
        releasePendingPayout(payoutRequest);
        payoutRequest.setStatus(PayoutStatus.REJECTED);
        payoutRequest.setAdminNote(trimToNull(request.getAdminNote()));
        payoutRequest.setReviewedBy(adminId);
        payoutRequest.setReviewedAt(LocalDateTime.now());
        return toPayoutResponse(payoutRepository.save(payoutRequest));
    }

    @Transactional
    public PayoutRequestResponse cancelPayoutRequest(String managerId, Long payoutRequestId) {
        PayoutRequest payoutRequest = findPendingPayout(payoutRequestId);
        if (!managerId.equals(payoutRequest.getManagerId())) {
            throw new AccessDeniedException("Managers can only cancel their own payout requests.");
        }
        releasePendingPayout(payoutRequest);
        payoutRequest.setStatus(PayoutStatus.CANCELED);
        payoutRequest.setReviewedAt(LocalDateTime.now());
        return toPayoutResponse(payoutRepository.save(payoutRequest));
    }

    private PayoutRequest findPendingPayout(Long payoutRequestId) {
        PayoutRequest payoutRequest = payoutRepository.findById(payoutRequestId)
                .orElseThrow(() -> new NoSuchElementException("Payout request with id " + payoutRequestId + " does not exist."));
        if (payoutRequest.getStatus() != PayoutStatus.PENDING) {
            throw new IllegalStateException("Only pending payout requests can be reviewed.");
        }
        return payoutRequest;
    }

    private void releasePendingPayout(PayoutRequest payoutRequest) {
        ManagerBalance balance = donationService.getOrCreateBalanceForUpdate(payoutRequest.getManagerId());
        balance.setPendingPayoutVnd(balance.getPendingPayoutVnd() - payoutRequest.getAmountVnd());
        balanceRepository.save(balance);
    }

    private PayoutRequestResponse toPayoutResponse(PayoutRequest payoutRequest) {
        return PayoutRequestResponse.builder()
                .id(payoutRequest.getId())
                .managerId(payoutRequest.getManagerId())
                .amountVnd(payoutRequest.getAmountVnd())
                .momoWalletPhone(payoutRequest.getMomoWalletPhone())
                .walletHolderName(payoutRequest.getWalletHolderName())
                .status(payoutRequest.getStatus())
                .note(payoutRequest.getNote())
                .adminNote(payoutRequest.getAdminNote())
                .providerReference(payoutRequest.getProviderReference())
                .reviewedBy(payoutRequest.getReviewedBy())
                .reviewedAt(payoutRequest.getReviewedAt())
                .createdAt(payoutRequest.getCreatedAt())
                .build();
    }

    private boolean isAdmin(String role) {
        return "ADMIN".equals(role) || "ROLE_ADMIN".equals(role) || "SYSTEM".equals(role) || "ROLE_SYSTEM".equals(role);
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
