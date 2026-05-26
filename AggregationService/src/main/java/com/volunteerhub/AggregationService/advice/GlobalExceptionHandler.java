package com.volunteerhub.AggregationService.advice;

import feign.FeignException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(FeignException.class)
    public ResponseEntity<String> handleFeignException(FeignException e) {
        HttpStatus status = HttpStatus.resolve(e.status());
        if (status == null) status = HttpStatus.INTERNAL_SERVER_ERROR;

        String message = e.contentUTF8();
        return ResponseEntity.status(status).body(message);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneralException(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("[AGGREGATION-SERVICE] " + e.getMessage());
    }
}
