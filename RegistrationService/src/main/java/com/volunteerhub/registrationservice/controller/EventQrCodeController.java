package com.volunteerhub.registrationservice.controller;

import com.volunteerhub.common.dto.UserEventResponse;
import com.volunteerhub.registrationservice.dto.QrCodeCreateRequest;
import com.volunteerhub.registrationservice.dto.QrCodeResponse;
import com.volunteerhub.registrationservice.dto.QrJoinRequest;
import com.volunteerhub.registrationservice.dto.QrPreviewResponse;
import com.volunteerhub.registrationservice.service.EventQrCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/registrations")
@RequiredArgsConstructor
public class EventQrCodeController {

    private final EventQrCodeService eventQrCodeService;

    @PostMapping("/events/{eventId}/qr-codes")
    public ResponseEntity<QrCodeResponse> createQrCode(@PathVariable Long eventId,
                                                       @RequestBody(required = false) QrCodeCreateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return new ResponseEntity<>(eventQrCodeService.createQrCode(authentication.getName(), eventId, request), HttpStatus.CREATED);
    }

    @GetMapping("/events/{eventId}/qr-codes")
    public ResponseEntity<List<QrCodeResponse>> listQrCodes(@PathVariable Long eventId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(eventQrCodeService.listQrCodes(authentication.getName(), eventId));
    }

    @DeleteMapping("/events/{eventId}/qr-codes/{qrCodeId}")
    public ResponseEntity<QrCodeResponse> revokeQrCode(@PathVariable Long eventId,
                                                       @PathVariable Long qrCodeId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(eventQrCodeService.revokeQrCode(authentication.getName(), eventId, qrCodeId));
    }

    @PostMapping("/events/{eventId}/completion-qr-codes")
    public ResponseEntity<QrCodeResponse> createCompletionQrCode(@PathVariable Long eventId,
                                                                 @RequestBody(required = false) QrCodeCreateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return new ResponseEntity<>(eventQrCodeService.createCompletionQrCode(authentication.getName(), eventId, request), HttpStatus.CREATED);
    }

    @GetMapping("/events/{eventId}/completion-qr-codes")
    public ResponseEntity<List<QrCodeResponse>> listCompletionQrCodes(@PathVariable Long eventId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(eventQrCodeService.listCompletionQrCodes(authentication.getName(), eventId));
    }

    @DeleteMapping("/events/{eventId}/completion-qr-codes/{qrCodeId}")
    public ResponseEntity<QrCodeResponse> revokeCompletionQrCode(@PathVariable Long eventId,
                                                                 @PathVariable Long qrCodeId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(eventQrCodeService.revokeCompletionQrCode(authentication.getName(), eventId, qrCodeId));
    }

    @GetMapping("/qr/preview")
    public ResponseEntity<QrPreviewResponse> preview(@RequestParam String token) {
        return ResponseEntity.ok(eventQrCodeService.preview(token));
    }

    @GetMapping("/qr/completion/preview")
    public ResponseEntity<QrPreviewResponse> previewCompletion(@RequestParam String token) {
        return ResponseEntity.ok(eventQrCodeService.previewCompletion(token));
    }

    @PostMapping("/qr/join")
    public ResponseEntity<UserEventResponse> join(@RequestBody QrJoinRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return new ResponseEntity<>(eventQrCodeService.join(authentication.getName(), request.getToken()), HttpStatus.CREATED);
    }

    @PostMapping("/qr/complete")
    public ResponseEntity<UserEventResponse> complete(@RequestBody QrJoinRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(eventQrCodeService.complete(authentication.getName(), request.getToken()));
    }
}
