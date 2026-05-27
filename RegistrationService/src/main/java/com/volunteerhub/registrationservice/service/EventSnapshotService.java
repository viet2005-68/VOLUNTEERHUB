package com.volunteerhub.registrationservice.service;

import com.volunteerhub.common.enums.EventStatus;
import com.volunteerhub.common.enums.QrJoinPolicy;
import com.volunteerhub.registrationservice.dto.EventSnapshotRequest;
import com.volunteerhub.registrationservice.model.EventSnapshot;
import com.volunteerhub.registrationservice.repository.EventSnapshotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class EventSnapshotService {

    private final EventSnapshotRepository eventSnapshotRepository;

    public EventSnapshot findEntityById(Long id) {
        return eventSnapshotRepository.findById(id).orElseThrow(() ->
                new NoSuchElementException("Event snapshot with id " + id + " does not exist."));
    }

    public void create(EventSnapshotRequest eventSnapshotRequest) {
        EventSnapshot eventSnapshot = EventSnapshot
                .builder()
                .eventId(eventSnapshotRequest.getEventId())
                .capacity(eventSnapshotRequest.getCapacity())
                .status(eventSnapshotRequest.getStatus())
                .ownerId(eventSnapshotRequest.getOwnerId())
                .eventName(eventSnapshotRequest.getEventName())
                .imageUrl(eventSnapshotRequest.getImageUrl())
                .startTime(eventSnapshotRequest.getStartTime())
                .endTime(eventSnapshotRequest.getEndTime())
                .registrationDeadline(eventSnapshotRequest.getRegistrationDeadline())
                .qrJoinPolicy(eventSnapshotRequest.getQrJoinPolicy() == null
                        ? QrJoinPolicy.REQUIRE_APPROVAL
                        : eventSnapshotRequest.getQrJoinPolicy())
                .build();
        eventSnapshotRepository.save(eventSnapshot);
    }

    public void update(EventSnapshotRequest eventSnapshotRequest) {
        EventSnapshot eventSnapshot = findEntityById(eventSnapshotRequest.getEventId());
        if (eventSnapshotRequest.getStatus() != null) {
            eventSnapshot.setStatus(eventSnapshotRequest.getStatus());
        }
        if (eventSnapshotRequest.getCapacity() != null) {
            eventSnapshot.setCapacity(eventSnapshotRequest.getCapacity());
        }
        if (eventSnapshotRequest.getOwnerId() != null) {
            eventSnapshot.setOwnerId(eventSnapshotRequest.getOwnerId());
        }
        if (eventSnapshotRequest.getEventName() != null) {
            eventSnapshot.setEventName(eventSnapshotRequest.getEventName());
        }
        if (eventSnapshotRequest.getImageUrl() != null) {
            eventSnapshot.setImageUrl(eventSnapshotRequest.getImageUrl());
        }
        if (eventSnapshotRequest.getStartTime() != null) {
            eventSnapshot.setStartTime(eventSnapshotRequest.getStartTime());
        }
        if (eventSnapshotRequest.getEndTime() != null) {
            eventSnapshot.setEndTime(eventSnapshotRequest.getEndTime());
        }
        if (eventSnapshotRequest.getRegistrationDeadline() != null) {
            eventSnapshot.setRegistrationDeadline(eventSnapshotRequest.getRegistrationDeadline());
        }
        if (eventSnapshotRequest.getQrJoinPolicy() != null) {
            eventSnapshot.setQrJoinPolicy(eventSnapshotRequest.getQrJoinPolicy());
        }
        eventSnapshotRepository.save(eventSnapshot);
    }

    public void delete(Long eventSnapshotId) {
        EventSnapshot eventSnapshot = findEntityById(eventSnapshotId);
        eventSnapshotRepository.delete(eventSnapshot);
    }

    public Long countEventPerManager(String ownerId) {
        return eventSnapshotRepository.countEventPerManager(ownerId);
    }

    public Long countEventActivePerManager(String ownerId) {
        return eventSnapshotRepository.countSnapshotsByStatus(ownerId, EventStatus.APPROVED);
    }

}
