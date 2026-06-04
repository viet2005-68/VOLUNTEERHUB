package com.vippro.AuthorizationServer;

import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import com.vippro.AuthorizationServer.service.TokenService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest(properties = {
		"spring.datasource.url=jdbc:h2:mem:authorizationserver_test;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
		"spring.datasource.driver-class-name=org.h2.Driver",
		"spring.jpa.hibernate.ddl-auto=none",
		"spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
		"HOST=localhost",
		"PORT=7070",
		"POSTGRES_PORT=5432",
		"POSTGRES_DB=users",
		"POSTGRES_USER=postgres",
		"POSTGRES_PASSWORD=admin",
		"CLIENT_ID=test-client",
		"CLIENT_SECRET=test-secret",
		"REDIRECT_URI=http://localhost:30080/login/oauth2/code/volunteerhub",
		"APP_CORS_ALLOWED_ORIGINS=http://localhost:30080"
})
class AuthorizationServerApplicationTests {

	@MockBean
	private TokenService tokenService;

	@MockBean
	private JWKSource<SecurityContext> jwkSource;

	@Test
	void contextLoads() {
	}

}
