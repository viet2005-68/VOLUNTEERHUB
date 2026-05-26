package com.vippro.AuthorizationServer.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.util.UriComponentsBuilder;

@Controller
public class LoginController {

    @Value("${app.client-uri}")
    private String clientAppUri;

    @Value("${app.google.client-id}")
    private String googleClientId;

    @Value("${app.google.redirect-path}")
    private String googleRedirectPath;

    @GetMapping("/login")
    public String login(Model model) {
        model.addAttribute("googleAuthUrl", buildGoogleAuthUrl());
        return "login";
    }

    private String buildGoogleAuthUrl() {
        String redirectUri = clientAppUri.replaceAll("/+$", "") + googleRedirectPath;
        return UriComponentsBuilder
                .fromUriString("https://accounts.google.com/o/oauth2/v2/auth")
                .queryParam("client_id", googleClientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("response_type", "code")
                .queryParam("scope", "openid email profile")
                .build()
                .encode()
                .toUriString();
    }
}
