package com.vippro.AuthorizationServer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AuthorizationServerApplication {

	public static void main(String[] args) {
		System.setProperty("user.timezone", "Asia/Ho_Chi_Minh");
		SpringApplication.run(AuthorizationServerApplication.class, args);
	}

}
