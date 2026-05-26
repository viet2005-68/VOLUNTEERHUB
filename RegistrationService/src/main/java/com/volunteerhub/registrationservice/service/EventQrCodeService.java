package com.volunteerhub.registrationservice.service;

import com.volunteerhub.common.dto.UserEventResponse;
import com.volunteerhub.common.enums.EventStatus;
import com.volunteerhub.common.enums.QrJoinPolicy;
import com.volunteerhub.common.enums.RegistrationSource;
import com.volunteerhub.common.enums.UserEventStatus;
import com.volunteerhub.registrationservice.dto.QrCodeCreateRequest;
import com.volunteerhub.registrationservice.dto.QrCodeResponse;
import com.volunteerhub.registrationservice.dto.QrPreviewResponse;
import com.volunteerhub.registrationservice.mapper.UserEventMapper;
import com.volunteerhub.registrationservice.model.EventQrCode;
import com.volunteerhub.registrationservice.model.EventSnapshot;
import com.volunteerhub.registrationservice.model.QrCodePurpose;
import com.volunteerhub.registrationservice.model.QrCodeStatus;
import com.volunteerhub.registrationservice.model.UserEvent;
import com.volunteerhub.registrationservice.publisher.RegistrationPublisher;
import com.volunteerhub.registrationservice.repository.EventQrCodeRepository;
import com.volunteerhub.registrationservice.repository.EventSnapshotRepository;
import com.volunteerhub.registrationservice.repository.UserEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class EventQrCodeService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final EventQrCodeRepository eventQrCodeRepository;
    private final EventSnapshotRepository eventSnapshotRepository;
    private final UserEventRepository userEventRepository;
    private final UserEventMapper userEventMapper;
    private final RegistrationPublisher registrationPublisher;

    @Value("${app.web.join-qr-base:http://localhost:3000/qr/join}")
    private String joinQrBase;

    @Value("${app.web.completion-qr-base:http://localhost:3000/qr/complete}")
    private String completionQrBase;

    @Transactional
    public QrCodeResponse createQrCode(String managerId, Long eventId, QrCodeCreateRequest request) {
        return createQrCodeForPurpose(managerId, eventId, request, QrCodePurpose.JOIN);
    }

    @Transactional
    public QrCodeResponse createCompletionQrCode(String managerId, Long eventId, QrCodeCreateRequest request) {
        return createQrCodeForPurpose(managerId, eventId, request, QrCodePurpose.COMPLETION);
    }

    private QrCodeResponse createQrCodeForPurpose(
            String managerId,
            Long eventId,
            QrCodeCreateRequest request,
            QrCodePurpose purpose
    ) {
        EventSnapshot snapshot = eventSnapshotRepository.findById(eventId)
                .orElseThrow(() -> new NoSuchElementException("Event snapshot with id " + eventId + " does not exist."));
        if (!snapshot.getOwnerId().equals(managerId)) {
            throw new AccessDeniedException("Only the event manager can create QR codes.");
        }
        if (snapshot.getStatus() != EventStatus.APPROVED) {
            throw new IllegalArgumentException("Only approved events can have QR codes.");
        }
        if (request != null && request.getMaxUses() != null && request.getMaxUses() <= 0) {
            throw new IllegalArgumentException("maxUses must be greater than 0.");
        }

        eventQrCodeRepository.findByEventIdAndPurposeOrderByIdDesc(eventId, purpose).stream()
                .filter(qrCode -> qrCode.getStatus() == QrCodeStatus.ACTIVE)
                .forEach(qrCode -> qrCode.setStatus(QrCodeStatus.REVOKED));

        String secret = newSecret();
        EventQrCode qrCode = EventQrCode.builder()
                .eventSnapshot(snapshot)
                .tokenSecretHash(hash(secret))
                .purpose(purpose)
                .status(QrCodeStatus.ACTIVE)
                .expiresAt(resolveExpiresAt(snapshot, request, purpose))
                .maxUses(request == null ? null : request.getMaxUses())
                .createdBy(managerId)
                .build();
        EventQrCode saved = eventQrCodeRepository.save(qrCode);
        String token = saved.getId() + "." + secret;
        return toResponse(saved, token);
    }

    @Transactional
    public QrCodeResponse revokeQrCode(String managerId, Long eventId, Long qrCodeId) {
        return revokeQrCode(managerId, eventId, qrCodeId, QrCodePurpose.JOIN);
    }

    @Transactional
    public QrCodeResponse revokeCompletionQrCode(String managerId, Long eventId, Long qrCodeId) {
        return revokeQrCode(managerId, eventId, qrCodeId, QrCodePurpose.COMPLETION);
    }

    private QrCodeResponse revokeQrCode(String managerId, Long eventId, Long qrCodeId, QrCodePurpose purpose) {
        EventQrCode qrCode = eventQrCodeRepository.findById(qrCodeId)
                .orElseThrow(() -> new NoSuchElementException("QR code with id " + qrCodeId + " does not exist."));
        if (!qrCode.getEventSnapshot().getEventId().equals(eventId)) {
            throw new IllegalArgumentException("QR code does not belong to event " + eventId + ".");
        }
        if (qrCode.getPurpose() != purpose) {
            throw new IllegalArgumentException("QR code does not match the requested purpose.");
        }
        if (!qrCode.getEventSnapshot().getOwnerId().equals(managerId)) {
            throw new AccessDeniedException("Only the event manager can revoke QR codes.");
        }
        qrCode.setStatus(QrCodeStatus.REVOKED);
        return toResponse(eventQrCodeRepository.save(qrCode), null);
    }

    @Transactional(readOnly = true)
    public List<QrCodeResponse> listQrCodes(String managerId, Long eventId) {
        return listQrCodes(managerId, eventId, QrCodePurpose.JOIN);
    }

    @Transactional(readOnly = true)
    public List<QrCodeResponse> listCompletionQrCodes(String managerId, Long eventId) {
        return listQrCodes(managerId, eventId, QrCodePurpose.COMPLETION);
    }

    private List<QrCodeResponse> listQrCodes(String managerId, Long eventId, QrCodePurpose purpose) {
        EventSnapshot snapshot = eventSnapshotRepository.findById(eventId)
                .orElseThrow(() -> new NoSuchElementException("Event snapshot with id " + eventId + " does not exist."));
        if (!snapshot.getOwnerId().equals(managerId)) {
            throw new AccessDeniedException("Only the event manager can view QR codes.");
        }
        return eventQrCodeRepository.findByEventIdAndPurposeOrderByIdDesc(eventId, purpose).stream()
                .map(qrCode -> toResponse(qrCode, null))
                .toList();
    }

    @Transactional(readOnly = true)
    public QrPreviewResponse preview(String token) {
        EventQrCode qrCode = findAndValidateToken(token, false, QrCodePurpose.JOIN);
        return toPreviewResponse(qrCode);
    }

    @Transactional(readOnly = true)
    public QrPreviewResponse previewCompletion(String token) {
        EventQrCode qrCode = findAndValidateToken(token, false, QrCodePurpose.COMPLETION);
        return toPreviewResponse(qrCode);
    }

    private QrPreviewResponse toPreviewResponse(EventQrCode qrCode) {
        EventSnapshot snapshot = qrCode.getEventSnapshot();
        return QrPreviewResponse.builder()
                .eventId(snapshot.getEventId())
                .eventName(snapshot.getEventName())
                .ownerId(snapshot.getOwnerId())
                .eventStatus(snapshot.getStatus())
                .qrJoinPolicy(snapshot.getQrJoinPolicy())
                .startTime(snapshot.getStartTime())
                .endTime(snapshot.getEndTime())
                .registrationDeadline(snapshot.getRegistrationDeadline())
                .capacity(snapshot.getCapacity())
                .participantCount(userEventRepository.countByEventIdAndStatus(snapshot.getEventId(), UserEventStatus.APPROVED))
                .build();
    }

    @Transactional
    public UserEventResponse join(String userId, String token) {
        ParsedToken parsedToken = parseToken(token);
        EventQrCode qrCode = eventQrCodeRepository.findByIdForUpdate(parsedToken.qrCodeId())
                .orElseThrow(() -> new NoSuchElementException("Invalid QR token."));
        validateQrCode(qrCode, parsedToken.secret(), true, QrCodePurpose.JOIN);

        EventSnapshot snapshot = eventSnapshotRepository.findByIdForUpdate(qrCode.getEventSnapshot().getEventId())
                .orElseThrow(() -> new NoSuchElementException("Event snapshot with id " + qrCode.getEventSnapshot().getEventId() + " does not exist."));
        validateEventCanAcceptQrJoin(snapshot);

        return userEventRepository.findByUserIdAndEventId(userId, snapshot.getEventId())
                .map(existing -> maybeAutoApproveExisting(existing, snapshot))
                .map(userEventMapper::toResponseDto)
                .orElseGet(() -> createQrRegistration(userId, snapshot, qrCode));
    }

    @Transactional
    public UserEventResponse complete(String userId, String token) {
        ParsedToken parsedToken = parseToken(token);
        EventQrCode qrCode = eventQrCodeRepository.findByIdForUpdate(parsedToken.qrCodeId())
                .orElseThrow(() -> new NoSuchElementException("Invalid QR token."));
        validateQrCode(qrCode, parsedToken.secret(), true, QrCodePurpose.COMPLETION);

        EventSnapshot snapshot = eventSnapshotRepository.findByIdForUpdate(qrCode.getEventSnapshot().getEventId())
                .orElseThrow(() -> new NoSuchElementException("Event snapshot with id " + qrCode.getEventSnapshot().getEventId() + " does not exist."));
        if (snapshot.getStatus() != EventStatus.APPROVED) {
            throw new IllegalArgumentException("Event is not approved.");
        }

        UserEvent userEvent = userEventRepository.findByUserIdAndEventId(userId, snapshot.getEventId())
                .orElseThrow(() -> new NoSuchElementException("You are not registered for this event."));

        if (userEvent.getStatus() == UserEventStatus.COMPLETED) {
            UserEventResponse response = userEventMapper.toResponseDto(userEvent);
            response.setAlreadyCompleted(true);
            return response;
        }
        if (userEvent.getStatus() != UserEventStatus.APPROVED) {
            throw new IllegalArgumentException("Only approved registrations can be completed by QR code.");
        }

        userEvent.setStatus(UserEventStatus.COMPLETED);
        userEvent.setCompletedAt(LocalDateTime.now());
        userEvent.setCompletedByQrCodeId(qrCode.getId());
        UserEvent savedUserEvent = userEventRepository.save(userEvent);

        qrCode.setUseCount(qrCode.getUseCount() + 1);
        eventQrCodeRepository.save(qrCode);
        registrationPublisher.publishEvent(userEventMapper.toCompletedMessage(savedUserEvent));

        return userEventMapper.toResponseDto(savedUserEvent);
    }

    private UserEventResponse createQrRegistration(String userId, EventSnapshot snapshot, EventQrCode qrCode) {
        UserEvent userEvent = UserEvent.builder()
                .userId(userId)
                .eventId(snapshot.getEventId())
                .eventSnapshot(snapshot)
                .source(RegistrationSource.QR)
                .qrCodeId(qrCode.getId())
                .build();
        if (snapshot.getQrJoinPolicy() == QrJoinPolicy.AUTO_APPROVE) {
            ensureCapacityAvailable(snapshot);
            userEvent.setStatus(UserEventStatus.APPROVED);
            userEvent.setReviewedAt(LocalDateTime.now());
        }
        UserEvent savedUserEvent = userEventRepository.save(userEvent);
        qrCode.setUseCount(qrCode.getUseCount() + 1);
        eventQrCodeRepository.save(qrCode);
        registrationPublisher.publishEvent(userEventMapper.toCreatedMessage(savedUserEvent, snapshot.getOwnerId()));
        if (savedUserEvent.getStatus() == UserEventStatus.APPROVED) {
            registrationPublisher.publishEvent(userEventMapper.toApprovedMessage(savedUserEvent));
        }
        return userEventMapper.toResponseDto(savedUserEvent);
    }

    private UserEvent maybeAutoApproveExisting(UserEvent existing, EventSnapshot snapshot) {
        if (snapshot.getQrJoinPolicy() == QrJoinPolicy.AUTO_APPROVE && existing.getStatus() == UserEventStatus.PENDING) {
            ensureCapacityAvailable(snapshot);
            existing.setStatus(UserEventStatus.APPROVED);
            existing.setReviewedAt(LocalDateTime.now());
            UserEvent saved = userEventRepository.save(existing);
            registrationPublisher.publishEvent(userEventMapper.toApprovedMessage(saved));
            return saved;
        }
        return existing;
    }

    private void ensureCapacityAvailable(EventSnapshot snapshot) {
        if (userEventRepository.countByEventIdAndStatus(snapshot.getEventId(), UserEventStatus.APPROVED) + 1 > snapshot.getCapacity()) {
            throw new IllegalArgumentException("Event capacity reached");
        }
    }

    private void validateEventCanAcceptQrJoin(EventSnapshot snapshot) {
        if (snapshot.getStatus() != EventStatus.APPROVED) {
            throw new IllegalArgumentException("Event is not approved.");
        }
        if (snapshot.getRegistrationDeadline() != null && LocalDateTime.now().isAfter(snapshot.getRegistrationDeadline())) {
            throw new IllegalArgumentException("Event registration deadline has passed.");
        }
    }

    private EventQrCode findAndValidateToken(String token, boolean lock, QrCodePurpose purpose) {
        ParsedToken parsedToken = parseToken(token);
        EventQrCode qrCode = (lock
                ? eventQrCodeRepository.findByIdForUpdate(parsedToken.qrCodeId())
                : eventQrCodeRepository.findById(parsedToken.qrCodeId()))
                .orElseThrow(() -> new NoSuchElementException("Invalid QR token."));
        validateQrCode(qrCode, parsedToken.secret(), true, purpose);
        return qrCode;
    }

    private void validateQrCode(EventQrCode qrCode, String secret, boolean checkUses, QrCodePurpose purpose) {
        if (!MessageDigest.isEqual(hash(secret).getBytes(StandardCharsets.UTF_8), qrCode.getTokenSecretHash().getBytes(StandardCharsets.UTF_8))) {
            throw new IllegalArgumentException("Invalid QR token.");
        }
        if (qrCode.getPurpose() != purpose) {
            throw new IllegalArgumentException("QR code does not match the requested purpose.");
        }
        if (qrCode.getStatus() != QrCodeStatus.ACTIVE) {
            throw new IllegalArgumentException("QR code has been revoked.");
        }
        if (qrCode.getExpiresAt() != null && LocalDateTime.now().isAfter(qrCode.getExpiresAt())) {
            throw new IllegalArgumentException("QR code has expired.");
        }
        if (checkUses && qrCode.getMaxUses() != null && qrCode.getUseCount() >= qrCode.getMaxUses()) {
            throw new IllegalArgumentException("QR code usage limit reached.");
        }
    }

    private LocalDateTime resolveExpiresAt(EventSnapshot snapshot, QrCodeCreateRequest request, QrCodePurpose purpose) {
        if (request != null && request.getExpiresAt() != null) {
            return request.getExpiresAt();
        }
        if (purpose == QrCodePurpose.COMPLETION) {
            return snapshot.getEndTime() == null ? LocalDateTime.now().plusHours(24) : snapshot.getEndTime().plusHours(24);
        }
        return snapshot.getRegistrationDeadline();
    }

    private QrCodeResponse toResponse(EventQrCode qrCode, String token) {
        return QrCodeResponse.builder()
                .id(qrCode.getId())
                .eventId(qrCode.getEventSnapshot().getEventId())
                .token(token)
                .qrPayload(token == null ? null : qrPayloadBase(qrCode.getPurpose()) + "?token=" + token)
                .purpose(qrCode.getPurpose())
                .status(qrCode.getStatus())
                .expiresAt(qrCode.getExpiresAt())
                .maxUses(qrCode.getMaxUses())
                .useCount(qrCode.getUseCount())
                .createdAt(qrCode.getCreatedAt())
                .build();
    }

    private String qrPayloadBase(QrCodePurpose purpose) {
        return purpose == QrCodePurpose.COMPLETION ? completionQrBase : joinQrBase;
    }

    private ParsedToken parseToken(String token) {
        if (token == null || token.isBlank() || !token.contains(".")) {
            throw new IllegalArgumentException("Invalid QR token.");
        }
        String[] parts = token.split("\\.", 2);
        try {
            return new ParsedToken(Long.parseLong(parts[0]), parts[1]);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid QR token.");
        }
    }

    private String newSecret() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Could not hash QR token secret.", e);
        }
    }

    private record ParsedToken(Long qrCodeId, String secret) {
    }
}
