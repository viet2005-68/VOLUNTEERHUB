package com.volunteerhub.registrationservice.service;

import com.volunteerhub.common.enums.EventStatus;
import com.volunteerhub.common.enums.QrJoinPolicy;
import com.volunteerhub.common.enums.RegistrationSource;
import com.volunteerhub.common.enums.UserEventStatus;
import com.volunteerhub.common.dto.message.registration.RegistrationApprovedMessage;
import com.volunteerhub.common.dto.message.registration.RegistrationCompletedMessage;
import com.volunteerhub.registrationservice.dto.QrCodeCreateRequest;
import com.volunteerhub.registrationservice.dto.QrCodeResponse;
import com.volunteerhub.registrationservice.dto.QrCodeRevokeRequest;
import com.volunteerhub.registrationservice.mapper.UserEventMapper;
import com.volunteerhub.registrationservice.model.EventQrCode;
import com.volunteerhub.registrationservice.model.EventSnapshot;
import com.volunteerhub.registrationservice.model.UserEvent;
import com.volunteerhub.registrationservice.publisher.RegistrationPublisher;
import com.volunteerhub.registrationservice.repository.EventQrCodeRepository;
import com.volunteerhub.registrationservice.repository.EventSnapshotRepository;
import com.volunteerhub.registrationservice.repository.UserEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class EventQrCodeServiceTest {

    @Mock
    EventQrCodeRepository eventQrCodeRepository;
    @Mock
    EventSnapshotRepository eventSnapshotRepository;
    @Mock
    UserEventRepository userEventRepository;
    @Mock
    RegistrationPublisher registrationPublisher;

    EventQrCodeService eventQrCodeService;
    final UserEventMapper userEventMapper = new UserEventMapper();
    final AtomicReference<EventQrCode> savedQrCode = new AtomicReference<>();

    @BeforeEach
    void setUp() {
        eventQrCodeService = new EventQrCodeService(
                eventQrCodeRepository,
                eventSnapshotRepository,
                userEventRepository,
                userEventMapper,
                registrationPublisher
        );
        ReflectionTestUtils.setField(eventQrCodeService, "joinQrBase", "http://localhost:5173/qr/join");
        ReflectionTestUtils.setField(eventQrCodeService, "completionQrBase", "http://localhost:5173/qr/complete");

        when(eventQrCodeRepository.findByEventIdOrderByIdDesc(1L)).thenReturn(List.of());
        when(eventQrCodeRepository.findByEventIdAndPurposeOrderByIdDesc(eq(1L), any())).thenReturn(List.of());
        when(eventQrCodeRepository.save(any(EventQrCode.class))).thenAnswer(invocation -> {
            EventQrCode qrCode = invocation.getArgument(0);
            if (qrCode.getId() == null) {
                qrCode.setId(99L);
            }
            savedQrCode.set(qrCode);
            return qrCode;
        });
        when(userEventRepository.save(any(UserEvent.class))).thenAnswer(invocation -> {
            UserEvent userEvent = invocation.getArgument(0);
            if (userEvent.getId() == null) {
                userEvent.setId(123L);
            }
            return userEvent;
        });
    }

    @Test
    void createQrCodeReturnsLabelAndNoteForMobileDisplay() {
        EventSnapshot snapshot = approvedSnapshot(QrJoinPolicy.REQUIRE_APPROVAL);
        QrCodeCreateRequest request = new QrCodeCreateRequest();
        request.setLabel("QR join main gate");
        request.setNote("Morning shift");
        when(eventSnapshotRepository.findById(1L)).thenReturn(Optional.of(snapshot));

        QrCodeResponse qrCode = eventQrCodeService.createQrCode("manager-1", 1L, request);

        assertThat(qrCode.getLabel()).isEqualTo("QR join main gate");
        assertThat(qrCode.getNote()).isEqualTo("Morning shift");
        assertThat(savedQrCode.get().getLabel()).isEqualTo("QR join main gate");
        assertThat(savedQrCode.get().getNote()).isEqualTo("Morning shift");
    }

    @Test
    void revokeQrCodeAllowsOptionalReasonAndStoresAuditFields() {
        EventSnapshot snapshot = approvedSnapshot(QrJoinPolicy.REQUIRE_APPROVAL);
        when(eventSnapshotRepository.findById(1L)).thenReturn(Optional.of(snapshot));

        eventQrCodeService.createQrCode("manager-1", 1L, new QrCodeCreateRequest());
        when(eventQrCodeRepository.findById(99L)).thenReturn(Optional.of(savedQrCode.get()));
        QrCodeRevokeRequest request = new QrCodeRevokeRequest();
        request.setRevokeReason("Created by mistake");

        QrCodeResponse revoked = eventQrCodeService.revokeQrCode("manager-1", 1L, 99L, request);

        assertThat(revoked.getStatus()).isEqualTo(com.volunteerhub.registrationservice.model.QrCodeStatus.REVOKED);
        assertThat(revoked.getRevokedAt()).isNotNull();
        assertThat(revoked.getRevokedBy()).isEqualTo("manager-1");
        assertThat(revoked.getRevokeReason()).isEqualTo("Created by mistake");
    }

    @Test
    void revokeQrCodeWorksWithoutReason() {
        EventSnapshot snapshot = approvedSnapshot(QrJoinPolicy.REQUIRE_APPROVAL);
        when(eventSnapshotRepository.findById(1L)).thenReturn(Optional.of(snapshot));

        eventQrCodeService.createQrCode("manager-1", 1L, new QrCodeCreateRequest());
        when(eventQrCodeRepository.findById(99L)).thenReturn(Optional.of(savedQrCode.get()));

        QrCodeResponse revoked = eventQrCodeService.revokeQrCode("manager-1", 1L, 99L);

        assertThat(revoked.getStatus()).isEqualTo(com.volunteerhub.registrationservice.model.QrCodeStatus.REVOKED);
        assertThat(revoked.getRevokedAt()).isNotNull();
        assertThat(revoked.getRevokedBy()).isEqualTo("manager-1");
        assertThat(revoked.getRevokeReason()).isNull();
    }

    @Test
    void qrJoinCreatesPendingRegistrationWhenApprovalIsRequired() {
        EventSnapshot snapshot = approvedSnapshot(QrJoinPolicy.REQUIRE_APPROVAL);
        when(eventSnapshotRepository.findById(1L)).thenReturn(Optional.of(snapshot));

        QrCodeResponse qrCode = eventQrCodeService.createQrCode("manager-1", 1L, new QrCodeCreateRequest());
        when(eventQrCodeRepository.findByIdForUpdate(99L)).thenReturn(Optional.of(savedQrCode.get()));
        when(eventSnapshotRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(snapshot));
        when(userEventRepository.findByUserIdAndEventId("volunteer-1", 1L)).thenReturn(Optional.empty());

        var response = eventQrCodeService.join("volunteer-1", qrCode.getToken());

        assertThat(response.getStatus()).isEqualTo(UserEventStatus.PENDING);
        assertThat(response.getSource()).isEqualTo(RegistrationSource.QR);
        assertThat(response.getQrCodeId()).isEqualTo(99L);
    }

    @Test
    void qrJoinAutoApprovesWhenPolicyAllowsAndCapacityExists() {
        EventSnapshot snapshot = approvedSnapshot(QrJoinPolicy.AUTO_APPROVE);
        when(eventSnapshotRepository.findById(1L)).thenReturn(Optional.of(snapshot));
        when(userEventRepository.countByEventIdAndStatus(1L, UserEventStatus.APPROVED)).thenReturn(0L);

        QrCodeResponse qrCode = eventQrCodeService.createQrCode("manager-1", 1L, new QrCodeCreateRequest());
        when(eventQrCodeRepository.findByIdForUpdate(99L)).thenReturn(Optional.of(savedQrCode.get()));
        when(eventSnapshotRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(snapshot));
        when(userEventRepository.findByUserIdAndEventId("volunteer-1", 1L)).thenReturn(Optional.empty());

        var response = eventQrCodeService.join("volunteer-1", qrCode.getToken());

        assertThat(response.getStatus()).isEqualTo(UserEventStatus.APPROVED);
        assertThat(response.getReviewedAt()).isNotNull();
        verify(registrationPublisher).publishEvent(any(RegistrationApprovedMessage.class));
    }

    @Test
    void completionQrCompletesApprovedRegistrationAndPublishesEvent() {
        EventSnapshot snapshot = approvedSnapshot(QrJoinPolicy.REQUIRE_APPROVAL);
        UserEvent existing = UserEvent.builder()
                .id(77L)
                .userId("volunteer-1")
                .eventId(1L)
                .eventSnapshot(snapshot)
                .status(UserEventStatus.APPROVED)
                .build();
        when(eventSnapshotRepository.findById(1L)).thenReturn(Optional.of(snapshot));

        QrCodeResponse qrCode = eventQrCodeService.createCompletionQrCode("manager-1", 1L, new QrCodeCreateRequest());
        when(eventQrCodeRepository.findByIdForUpdate(99L)).thenReturn(Optional.of(savedQrCode.get()));
        when(eventSnapshotRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(snapshot));
        when(userEventRepository.findByUserIdAndEventId("volunteer-1", 1L)).thenReturn(Optional.of(existing));

        var response = eventQrCodeService.complete("volunteer-1", qrCode.getToken());

        assertThat(response.getStatus()).isEqualTo(UserEventStatus.COMPLETED);
        assertThat(response.getCompletedAt()).isNotNull();
        assertThat(response.getCompletedByQrCodeId()).isEqualTo(99L);
        assertThat(savedQrCode.get().getUseCount()).isEqualTo(1);
        verify(registrationPublisher).publishEvent(any(RegistrationCompletedMessage.class));
    }

    @Test
    void completionQrReturnsExistingCompletedRegistrationWithoutCountingAgain() {
        EventSnapshot snapshot = approvedSnapshot(QrJoinPolicy.REQUIRE_APPROVAL);
        UserEvent existing = UserEvent.builder()
                .id(77L)
                .userId("volunteer-1")
                .eventId(1L)
                .eventSnapshot(snapshot)
                .status(UserEventStatus.COMPLETED)
                .build();
        when(eventSnapshotRepository.findById(1L)).thenReturn(Optional.of(snapshot));

        QrCodeResponse qrCode = eventQrCodeService.createCompletionQrCode("manager-1", 1L, new QrCodeCreateRequest());
        when(eventQrCodeRepository.findByIdForUpdate(99L)).thenReturn(Optional.of(savedQrCode.get()));
        when(eventSnapshotRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(snapshot));
        when(userEventRepository.findByUserIdAndEventId("volunteer-1", 1L)).thenReturn(Optional.of(existing));

        var response = eventQrCodeService.complete("volunteer-1", qrCode.getToken());

        assertThat(response.getStatus()).isEqualTo(UserEventStatus.COMPLETED);
        assertThat(response.getAlreadyCompleted()).isTrue();
        assertThat(savedQrCode.get().getUseCount()).isZero();
        verify(registrationPublisher, never()).publishEvent(any(RegistrationCompletedMessage.class));
    }

    @Test
    void completionQrRejectsNonApprovedRegistration() {
        EventSnapshot snapshot = approvedSnapshot(QrJoinPolicy.REQUIRE_APPROVAL);
        UserEvent existing = UserEvent.builder()
                .id(77L)
                .userId("volunteer-1")
                .eventId(1L)
                .eventSnapshot(snapshot)
                .status(UserEventStatus.PENDING)
                .build();
        when(eventSnapshotRepository.findById(1L)).thenReturn(Optional.of(snapshot));

        QrCodeResponse qrCode = eventQrCodeService.createCompletionQrCode("manager-1", 1L, new QrCodeCreateRequest());
        when(eventQrCodeRepository.findByIdForUpdate(99L)).thenReturn(Optional.of(savedQrCode.get()));
        when(eventSnapshotRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(snapshot));
        when(userEventRepository.findByUserIdAndEventId("volunteer-1", 1L)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> eventQrCodeService.complete("volunteer-1", qrCode.getToken()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Only approved registrations");
    }

    @Test
    void completionQrRejectsExpiredToken() {
        EventSnapshot snapshot = approvedSnapshot(QrJoinPolicy.REQUIRE_APPROVAL);
        QrCodeCreateRequest request = new QrCodeCreateRequest();
        request.setExpiresAt(LocalDateTime.now().minusMinutes(1));
        when(eventSnapshotRepository.findById(1L)).thenReturn(Optional.of(snapshot));

        QrCodeResponse qrCode = eventQrCodeService.createCompletionQrCode("manager-1", 1L, request);
        when(eventQrCodeRepository.findByIdForUpdate(99L)).thenReturn(Optional.of(savedQrCode.get()));

        assertThatThrownBy(() -> eventQrCodeService.complete("volunteer-1", qrCode.getToken()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("expired");
    }

    @Test
    void completionQrRejectsRevokedToken() {
        EventSnapshot snapshot = approvedSnapshot(QrJoinPolicy.REQUIRE_APPROVAL);
        when(eventSnapshotRepository.findById(1L)).thenReturn(Optional.of(snapshot));

        QrCodeResponse qrCode = eventQrCodeService.createCompletionQrCode("manager-1", 1L, new QrCodeCreateRequest());
        savedQrCode.get().setStatus(com.volunteerhub.registrationservice.model.QrCodeStatus.REVOKED);
        when(eventQrCodeRepository.findByIdForUpdate(99L)).thenReturn(Optional.of(savedQrCode.get()));

        assertThatThrownBy(() -> eventQrCodeService.complete("volunteer-1", qrCode.getToken()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("revoked");
    }

    @Test
    void completionQrCreateRejectsNonOwner() {
        EventSnapshot snapshot = approvedSnapshot(QrJoinPolicy.REQUIRE_APPROVAL);
        when(eventSnapshotRepository.findById(1L)).thenReturn(Optional.of(snapshot));

        assertThatThrownBy(() -> eventQrCodeService.createCompletionQrCode("other-manager", 1L, new QrCodeCreateRequest()))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Only the event manager");
    }

    @Test
    void completionQrListAndRevokeAreScopedToCompletionPurpose() {
        EventSnapshot snapshot = approvedSnapshot(QrJoinPolicy.REQUIRE_APPROVAL);
        when(eventSnapshotRepository.findById(1L)).thenReturn(Optional.of(snapshot));

        eventQrCodeService.createCompletionQrCode("manager-1", 1L, new QrCodeCreateRequest());
        when(eventQrCodeRepository.findByEventIdAndPurposeOrderByIdDesc(
                eq(1L),
                eq(com.volunteerhub.registrationservice.model.QrCodePurpose.COMPLETION)
        )).thenReturn(List.of(savedQrCode.get()));
        when(eventQrCodeRepository.findById(99L)).thenReturn(Optional.of(savedQrCode.get()));

        var list = eventQrCodeService.listCompletionQrCodes("manager-1", 1L);
        var revoked = eventQrCodeService.revokeCompletionQrCode("manager-1", 1L, 99L);

        assertThat(list).hasSize(1);
        assertThat(revoked.getStatus()).isEqualTo(com.volunteerhub.registrationservice.model.QrCodeStatus.REVOKED);
    }

    @Test
    void completionQrRejectsInvalidTokenShape() {
        assertThatThrownBy(() -> eventQrCodeService.complete("volunteer-1", "not-a-token"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid QR token");
    }

    @Test
    void duplicateQrScanReturnsExistingRegistration() {
        EventSnapshot snapshot = approvedSnapshot(QrJoinPolicy.REQUIRE_APPROVAL);
        UserEvent existing = UserEvent.builder()
                .id(55L)
                .userId("volunteer-1")
                .eventId(1L)
                .eventSnapshot(snapshot)
                .status(UserEventStatus.PENDING)
                .source(RegistrationSource.MANUAL)
                .build();
        when(eventSnapshotRepository.findById(1L)).thenReturn(Optional.of(snapshot));

        QrCodeResponse qrCode = eventQrCodeService.createQrCode("manager-1", 1L, new QrCodeCreateRequest());
        when(eventQrCodeRepository.findByIdForUpdate(99L)).thenReturn(Optional.of(savedQrCode.get()));
        when(eventSnapshotRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(snapshot));
        when(userEventRepository.findByUserIdAndEventId("volunteer-1", 1L)).thenReturn(Optional.of(existing));

        var response = eventQrCodeService.join("volunteer-1", qrCode.getToken());

        assertThat(response.getId()).isEqualTo(55L);
        assertThat(response.getSource()).isEqualTo(RegistrationSource.MANUAL);
        verify(userEventRepository, never()).save(argThat(userEvent -> userEvent.getId() == null));
    }

    private EventSnapshot approvedSnapshot(QrJoinPolicy policy) {
        return EventSnapshot.builder()
                .eventId(1L)
                .eventName("Beach cleanup")
                .capacity(10)
                .status(EventStatus.APPROVED)
                .ownerId("manager-1")
                .registrationDeadline(LocalDateTime.now().plusDays(1))
                .qrJoinPolicy(policy)
                .build();
    }
}
