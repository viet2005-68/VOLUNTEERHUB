package com.volunteerhub.userservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"spring.datasource.url=jdbc:h2:mem:userservice_test;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
		"spring.datasource.driver-class-name=org.h2.Driver",
		"spring.jpa.hibernate.ddl-auto=none",
		"spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
		"spring.rabbitmq.listener.simple.auto-startup=false",
		"spring.cloud.discovery.enabled=false",
		"eureka.client.enabled=false",
		"HOST=localhost",
		"PORT=0",
		"REDIS_PORT=6379",
		"REDIS_PASSWORD=",
		"RABBITMQ_PORT=5672",
		"RABBITMQ_DEFAULT_USER=guest",
		"RABBITMQ_DEFAULT_PASS=guest",
		"EUREKA_SERVER_URL=http://localhost:8761/eureka/"
})
class UserServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
