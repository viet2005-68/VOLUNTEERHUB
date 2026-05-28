package com.volunteerhub.registrationservice.consumer;

import com.volunteerhub.common.dto.message.event.EventApprovedMessage;
import com.volunteerhub.common.dto.message.event.EventDeletedMessage;
import com.volunteerhub.common.dto.message.event.EventMessage;
import com.volunteerhub.common.dto.message.event.EventUpdatedMessage;
import com.volunteerhub.common.enums.QrJoinPolicy;
import com.volunteerhub.registrationservice.config.RabbitMQConfig;
import com.volunteerhub.registrationservice.dto.EventSnapshotRequest;
import com.volunteerhub.registrationservice.service.EventSnapshotService;
import com.volunteerhub.registrationservice.service.UserEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class EventConsumer {

    private final EventSnapshotService eventSnapshotService;
    private final UserEventService userEventService;

    @RabbitListener(queues = RabbitMQConfig.EVENT_QUEUE)
    private void handleEvent(EventMessage eventMessage) {
        if (eventMessage instanceof EventApprovedMessage) {
                    EventSnapshotRequest eventSnapshotRequest = EventSnapshotRequest
                            .builder()
                            .eventId(((EventApprovedMessage) eventMessage).getEventId())
                            .eventName(((EventApprovedMessage) eventMessage).getEventName())
                            .capacity(((EventApprovedMessage) eventMessage).getCapacity())
                            .status(((EventApprovedMessage) eventMessage).getStatus())
                            .ownerId(((EventApprovedMessage) eventMessage).getOwnerId())
                            .imageUrl(((EventApprovedMessage) eventMessage).getImageUrl())
                            .startTime(((EventApprovedMessage) eventMessage).getStartTime())
                            .endTime(((EventApprovedMessage) eventMessage).getEndTime())
                            .registrationDeadline(((EventApprovedMessage) eventMessage).getRegistrationDeadline())
                            .qrJoinPolicy(((EventApprovedMessage) eventMessage).getQrJoinPolicy())
                            .completionBadgeId(((EventApprovedMessage) eventMessage).getCompletionBadgeId())
                            .build();
                    eventSnapshotService.create(eventSnapshotRequest);
                }
                else if (eventMessage instanceof EventUpdatedMessage) {
                    try {
                EventUpdatedMessage updatedMessage = (EventUpdatedMessage) eventMessage;
                if (updatedMessage.getUpdatedFields().containsKey("capacity")
                        || updatedMessage.getUpdatedFields().containsKey("name")
                        || updatedMessage.getUpdatedFields().containsKey("start_time")
                        || updatedMessage.getUpdatedFields().containsKey("end_time")
                        || updatedMessage.getUpdatedFields().containsKey("image_url")
                        || updatedMessage.getUpdatedFields().containsKey("registration_deadline")
                        || updatedMessage.getUpdatedFields().containsKey("qr_join_policy")
                        || updatedMessage.getUpdatedFields().containsKey("completion_badge_id")) {
                    EventSnapshotRequest eventSnapshotRequest = EventSnapshotRequest
                            .builder()
                            .eventId(updatedMessage.getId())
                            .capacity((Integer) updatedMessage.getUpdatedFields().get("capacity"))
                            .eventName((String) updatedMessage.getUpdatedFields().get("name"))
                            .imageUrl((String) updatedMessage.getUpdatedFields().get("image_url"))
                            .startTime(toLocalDateTime(updatedMessage.getUpdatedFields().get("start_time")))
                            .endTime(toLocalDateTime(updatedMessage.getUpdatedFields().get("end_time")))
                            .registrationDeadline(toLocalDateTime(updatedMessage.getUpdatedFields().get("registration_deadline")))
                            .qrJoinPolicy(toQrJoinPolicy(updatedMessage.getUpdatedFields().get("qr_join_policy")))
                            .completionBadgeId(toLong(updatedMessage.getUpdatedFields().get("completion_badge_id")))
                            .build();
                    eventSnapshotService.update(eventSnapshotRequest);
                }
            }
            catch (Exception e) {
                System.out.println("FAILED TO UPDATE EVENT SNAPSHOT WITH ID " + ((EventUpdatedMessage) eventMessage).getId());
            }
        }
        else if (eventMessage instanceof EventDeletedMessage) {
            try {
                eventSnapshotService.delete(((EventDeletedMessage) eventMessage).getEventId());
            } catch (Exception e) {
                System.out.println("FAILED TO DELETE EVENT SNAPSHOT WITH ID " + ((EventDeletedMessage) eventMessage).getEventId());
            }
        }
    }

    private LocalDateTime toLocalDateTime(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof LocalDateTime localDateTime) {
            return localDateTime;
        }
        if (value instanceof String text) {
            return LocalDateTime.parse(text);
        }
        if (value instanceof List<?> parts && parts.size() >= 5) {
            return LocalDateTime.of(
                    ((Number) parts.get(0)).intValue(),
                    ((Number) parts.get(1)).intValue(),
                    ((Number) parts.get(2)).intValue(),
                    ((Number) parts.get(3)).intValue(),
                    ((Number) parts.get(4)).intValue(),
                    parts.size() > 5 ? ((Number) parts.get(5)).intValue() : 0
            );
        }
        throw new IllegalArgumentException("Unsupported LocalDateTime value: " + value);
    }

    private QrJoinPolicy toQrJoinPolicy(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof QrJoinPolicy qrJoinPolicy) {
            return qrJoinPolicy;
        }
        return QrJoinPolicy.valueOf(String.valueOf(value));
    }

    private Long toLong(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        return Long.valueOf(String.valueOf(value));
    }

}
