package com.volunteerhub.donationservice.service;

import com.volunteerhub.donationservice.dto.CreateMockDonationRequest;
import com.volunteerhub.donationservice.dto.DonationResponse;
import com.volunteerhub.donationservice.dto.EventDonationSummaryResponse;
import com.volunteerhub.donationservice.dto.ManagerBalanceResponse;
import com.volunteerhub.donationservice.model.Donation;
import com.volunteerhub.donationservice.model.DonationStatus;
import com.volunteerhub.donationservice.model.ManagerBalance;
import com.volunteerhub.donationservice.repository.DonationRepository;
import com.volunteerhub.donationservice.repository.ManagerBalanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DonationService {

    private static final String MOCK_PROVIDER = "MOMO_MOCK";

    private final DonationRepository donationRepository;
    private final ManagerBalanceRepository balanceRepository;

    @Transactional
    public DonationResponse createSuccessfulMockDonation(String donorId, CreateMockDonationRequest request) {
        return donationRepository.findByDonorIdAndClientDonationId(donorId, request.getClientDonationId())
                .map(this::toDonationResponse)
                .orElseGet(() -> {
                    Donation donation = Donation.builder()
                            .donorId(donorId)
                            .managerId(request.getManagerId())
                            .eventId(request.getEventId())
                            .clientDonationId(request.getClientDonationId())
                            .amountVnd(request.getAmountVnd())
                            .provider(MOCK_PROVIDER)
                            .providerTransactionId("mock-" + UUID.randomUUID())
                            .status(DonationStatus.SUCCEEDED)
                            .message(trimToNull(request.getMessage()))
                            .settledAt(LocalDateTime.now())
                            .build();
                    Donation saved = donationRepository.save(donation);
                    creditManagerBalance(saved.getManagerId(), saved.getAmountVnd());
                    return toDonationResponse(saved);
                });
    }

    @Transactional(readOnly = true)
    public List<DonationResponse> listMyDonations(String donorId) {
        return donationRepository.findByDonorIdOrderByCreatedAtDesc(donorId).stream()
                .map(this::toDonationResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DonationResponse> listMyEventDonations(String donorId, Long eventId) {
        return donationRepository.findByDonorIdAndEventIdOrderByCreatedAtDesc(donorId, eventId).stream()
                .map(this::toDonationResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public EventDonationSummaryResponse getMyEventDonationSummary(String donorId, Long eventId) {
        return EventDonationSummaryResponse.builder()
                .eventId(eventId)
                .totalSucceededAmountVnd(donationRepository.sumAmountByDonorIdAndEventIdAndStatus(
                        donorId, eventId, DonationStatus.SUCCEEDED))
                .succeededDonationCount(donationRepository.countByDonorIdAndEventIdAndStatus(
                        donorId, eventId, DonationStatus.SUCCEEDED))
                .build();
    }

    @Transactional(readOnly = true)
    public DonationResponse getDonation(String currentUserId, String role, Long donationId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new NoSuchElementException("Donation with id " + donationId + " does not exist."));
        if (!isAdmin(role) && !currentUserId.equals(donation.getDonorId()) && !currentUserId.equals(donation.getManagerId())) {
            throw new AccessDeniedException("Insufficient permission to view this donation.");
        }
        return toDonationResponse(donation);
    }

    @Transactional(readOnly = true)
    public List<DonationResponse> listManagerDonations(String currentUserId, String role, String managerId) {
        if (!isAdmin(role) && !currentUserId.equals(managerId)) {
            throw new AccessDeniedException("Managers can only view their own donations.");
        }
        return donationRepository.findByManagerIdOrderByCreatedAtDesc(managerId).stream()
                .map(this::toDonationResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DonationResponse> listEventDonations(String currentUserId, String role, Long eventId) {
        if (isAdmin(role)) {
            return donationRepository.findByEventIdOrderByCreatedAtDesc(eventId).stream()
                    .map(this::toDonationResponse)
                    .toList();
        }
        if (isManager(role)) {
            return donationRepository.findByEventIdAndManagerIdOrderByCreatedAtDesc(eventId, currentUserId).stream()
                    .map(this::toDonationResponse)
                    .toList();
        }
        throw new AccessDeniedException("Only managers and admins can view event donation history.");
    }

    @Transactional(readOnly = true)
    public EventDonationSummaryResponse getEventDonationSummary(String currentUserId, String role, Long eventId) {
        if (!isAdmin(role) && !isManager(role)) {
            throw new AccessDeniedException("Only managers and admins can view event donation summary.");
        }
        List<Donation> donations = isAdmin(role)
                ? donationRepository.findByEventIdOrderByCreatedAtDesc(eventId)
                : donationRepository.findByEventIdAndManagerIdOrderByCreatedAtDesc(eventId, currentUserId);
        long total = donations.stream()
                .filter(donation -> donation.getStatus() == DonationStatus.SUCCEEDED)
                .mapToLong(Donation::getAmountVnd)
                .sum();
        long count = donations.stream()
                .filter(donation -> donation.getStatus() == DonationStatus.SUCCEEDED)
                .count();
        return EventDonationSummaryResponse.builder()
                .eventId(eventId)
                .totalSucceededAmountVnd(total)
                .succeededDonationCount(count)
                .build();
    }

    @Transactional(readOnly = true)
    public ManagerBalanceResponse getManagerBalance(String currentUserId, String role, String managerId) {
        if (!isAdmin(role) && !currentUserId.equals(managerId)) {
            throw new AccessDeniedException("Managers can only view their own balance.");
        }
        return toBalanceResponse(getOrNewBalance(managerId));
    }

    @Transactional
    public DonationResponse markDonationSucceeded(Long donationId, String providerTransactionId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new NoSuchElementException("Donation with id " + donationId + " does not exist."));
        if (donation.getStatus() == DonationStatus.SUCCEEDED) {
            return toDonationResponse(donation);
        }
        if (donation.getStatus() != DonationStatus.PENDING) {
            throw new IllegalStateException("Only pending donations can be settled.");
        }
        donation.setStatus(DonationStatus.SUCCEEDED);
        donation.setProviderTransactionId(providerTransactionId);
        donation.setSettledAt(LocalDateTime.now());
        creditManagerBalance(donation.getManagerId(), donation.getAmountVnd());
        return toDonationResponse(donationRepository.save(donation));
    }

    @Transactional
    public DonationResponse markProviderDonationSucceeded(String provider, String providerOrderId, String providerTransactionId) {
        Donation donation = donationRepository.findByProviderAndProviderOrderId(provider, providerOrderId)
                .orElseThrow(() -> new NoSuchElementException("Donation order " + providerOrderId + " does not exist."));
        if (donation.getStatus() == DonationStatus.SUCCEEDED) {
            return toDonationResponse(donation);
        }
        if (donation.getStatus() != DonationStatus.PENDING) {
            throw new IllegalStateException("Only pending donations can be settled.");
        }
        donation.setStatus(DonationStatus.SUCCEEDED);
        donation.setProviderTransactionId(providerTransactionId);
        donation.setSettledAt(LocalDateTime.now());
        creditManagerBalance(donation.getManagerId(), donation.getAmountVnd());
        return toDonationResponse(donationRepository.save(donation));
    }

    @Transactional
    public DonationResponse markProviderDonationFailed(String provider, String providerOrderId) {
        Donation donation = donationRepository.findByProviderAndProviderOrderId(provider, providerOrderId)
                .orElseThrow(() -> new NoSuchElementException("Donation order " + providerOrderId + " does not exist."));
        if (donation.getStatus() == DonationStatus.PENDING) {
            donation.setStatus(DonationStatus.FAILED);
        }
        return toDonationResponse(donationRepository.save(donation));
    }

    private void creditManagerBalance(String managerId, Long amountVnd) {
        ManagerBalance balance = getOrCreateBalanceForUpdate(managerId);
        balance.setTotalReceivedVnd(balance.getTotalReceivedVnd() + amountVnd);
        balanceRepository.save(balance);
    }

    ManagerBalance getOrCreateBalanceForUpdate(String managerId) {
        return balanceRepository.findByManagerIdForUpdate(managerId)
                .orElseGet(() -> balanceRepository.saveAndFlush(ManagerBalance.builder()
                        .managerId(managerId)
                        .build()));
    }

    private ManagerBalance getOrNewBalance(String managerId) {
        return balanceRepository.findByManagerId(managerId)
                .orElseGet(() -> ManagerBalance.builder().managerId(managerId).build());
    }

    ManagerBalanceResponse toBalanceResponse(ManagerBalance balance) {
        return ManagerBalanceResponse.builder()
                .managerId(balance.getManagerId())
                .totalReceivedVnd(balance.getTotalReceivedVnd())
                .pendingPayoutVnd(balance.getPendingPayoutVnd())
                .paidOutVnd(balance.getPaidOutVnd())
                .availableVnd(balance.availableVnd())
                .build();
    }

    private DonationResponse toDonationResponse(Donation donation) {
        return DonationResponse.builder()
                .id(donation.getId())
                .donorId(donation.getDonorId())
                .managerId(donation.getManagerId())
                .eventId(donation.getEventId())
                .clientDonationId(donation.getClientDonationId())
                .amountVnd(donation.getAmountVnd())
                .provider(donation.getProvider())
                .providerOrderId(donation.getProviderOrderId())
                .providerTransactionId(donation.getProviderTransactionId())
                .status(donation.getStatus())
                .message(donation.getMessage())
                .settledAt(donation.getSettledAt())
                .createdAt(donation.getCreatedAt())
                .build();
    }

    private boolean isAdmin(String role) {
        return "ADMIN".equals(role) || "ROLE_ADMIN".equals(role) || "SYSTEM".equals(role) || "ROLE_SYSTEM".equals(role);
    }

    private boolean isManager(String role) {
        return "MANAGER".equals(role) || "ROLE_MANAGER".equals(role);
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
