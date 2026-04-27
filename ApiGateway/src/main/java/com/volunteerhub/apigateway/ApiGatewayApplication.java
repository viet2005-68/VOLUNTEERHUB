package com.volunteerhub.apigateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class ApiGatewayApplication {

	public static void main(String[] args) {
		System.setProperty("user.timezone", "Asia/Ho_Chi_Minh");
		SpringApplication.run(ApiGatewayApplication.class, args);
	}

}
