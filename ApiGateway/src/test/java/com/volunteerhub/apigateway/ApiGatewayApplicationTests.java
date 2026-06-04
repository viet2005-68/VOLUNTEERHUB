package com.volunteerhub.apigateway;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"server.port=0",
		"spring.data.redis.host=localhost",
		"spring.data.redis.port=6379",
		"spring.data.redis.password=",
		"spring.cloud.discovery.enabled=false",
		"eureka.client.enabled=false",
		"app.cors.allowed-origins=http://localhost:30080",
		"spring.security.oauth2.google.issuer=https://accounts.google.com",
		"spring.security.oauth2.google.jwk-uri=https://www.googleapis.com/oauth2/v3/certs",
		"spring.security.oauth2.volunteerhub.issuer=http://localhost:7070",
		"spring.security.oauth2.volunteerhub.jwk-uri=http://localhost:7070/oauth2/jwks"
})
class ApiGatewayApplicationTests {

	@Test
	void contextLoads() {
	}

}
