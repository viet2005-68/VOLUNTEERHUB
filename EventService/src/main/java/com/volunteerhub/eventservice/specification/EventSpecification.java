package com.volunteerhub.eventservice.specification;

import com.volunteerhub.common.enums.EventStatus;
import com.volunteerhub.eventservice.model.Event;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class EventSpecification {

    public static Specification<Event> filterEvents(
            String categoryName,
            EventStatus status,
            LocalDateTime startAfter,
            LocalDateTime endBefore,
            String province,
            String district,
            String street,
            String ownerId
    ) {
        return (root, query, criteriaBuilder) -> {
            Predicate predicate = criteriaBuilder.conjunction();

            if (categoryName != null && !categoryName.isEmpty()) {
                Join<Object, Object> categoryJoin = root.join("category", JoinType.LEFT);
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.like(
                                criteriaBuilder.lower(categoryJoin.get("name")),
                                "%" + categoryName.toLowerCase() + "%"
                        ));
            }

            if ((province != null && !province.isEmpty()) ||
                    (district != null && !district.isEmpty()) ||
                    (street != null && !street.isEmpty())) {

                Join<Object, Object> addressJoin = root.join("address", JoinType.LEFT);

                if (province != null && !province.isEmpty()) {
                    predicate = criteriaBuilder.and(predicate,
                            criteriaBuilder.like(
                                    criteriaBuilder.lower(addressJoin.get("province")),
                                    "%" + province.toLowerCase() + "%"
                            ));
                }

                if (district != null && !district.isEmpty()) {
                    predicate = criteriaBuilder.and(predicate,
                            criteriaBuilder.like(
                                    criteriaBuilder.lower(addressJoin.get("district")),
                                    "%" + district.toLowerCase() + "%"
                            ));
                }

                if (street != null && !street.isEmpty()) {
                    predicate = criteriaBuilder.and(predicate,
                            criteriaBuilder.like(
                                    criteriaBuilder.lower(addressJoin.get("street")),
                                    "%" + street.toLowerCase() + "%"
                            ));
                }
            }

            // Filter by status
            if (status != null) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.equal(root.get("status"), status));
            }

            // Filter by start and end time
            if (startAfter != null) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.greaterThanOrEqualTo(root.get("startTime"), startAfter));
            }

            if (endBefore != null) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.lessThanOrEqualTo(root.get("endTime"), endBefore));
            }

            if (ownerId != null) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.equal(root.get("ownerId"), ownerId));
            }

            return predicate;
        };
    }
}
