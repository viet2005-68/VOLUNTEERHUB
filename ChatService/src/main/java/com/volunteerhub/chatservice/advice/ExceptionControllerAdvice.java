package com.volunteerhub.chatservice.advice;

import com.volunteerhub.chatservice.dto.ChatMessageResponse;
import com.volunteerhub.chatservice.service.ChatService;
import com.volunteerhub.common.dto.ErrorDetails;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.NoSuchElementException;

@RestControllerAdvice
public class ExceptionControllerAdvice {

    @ExceptionHandler(ChatService.IdempotentMessageException.class)
    public ResponseEntity<ChatMessageResponse> handleIdempotent(ChatService.IdempotentMessageException ex) {
        return ResponseEntity.ok(ex.getResponse());
    }

    @ExceptionHandler({IllegalArgumentException.class, MethodArgumentNotValidException.class})
    public ResponseEntity<ErrorDetails> handleBadRequest(Exception ex) {
        return buildResponse(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({NoSuchElementException.class, EntityNotFoundException.class})
    public ResponseEntity<ErrorDetails> handleNotFound(Exception ex) {
        return buildResponse(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorDetails> handleAccessDenied(AccessDeniedException ex) {
        return buildResponse(ex.getMessage(), HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler({DataIntegrityViolationException.class, EmptyResultDataAccessException.class})
    public ResponseEntity<ErrorDetails> handleDataIntegrity(Exception ex) {
        return buildResponse(ex.getMessage(), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorDetails> handleAll(Exception ex) {
        return buildResponse(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private ResponseEntity<ErrorDetails> buildResponse(String message, HttpStatus status) {
        ErrorDetails errorDetails = new ErrorDetails();
        errorDetails.setMessage(message);
        return new ResponseEntity<>(errorDetails, status);
    }
}
