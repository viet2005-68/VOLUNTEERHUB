package com.volunteerhub.notificationservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"server.port=0",
		"spring.datasource.url=jdbc:h2:mem:notificationservice_test;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
		"spring.datasource.driver-class-name=org.h2.Driver",
		"spring.jpa.hibernate.ddl-auto=create-drop",
		"spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
		"spring.rabbitmq.host=localhost",
		"spring.rabbitmq.port=5672",
		"spring.rabbitmq.username=guest",
		"spring.rabbitmq.password=guest",
		"spring.rabbitmq.listener.simple.auto-startup=false",
		"spring.rabbitmq.listener.direct.auto-startup=false",
		"spring.cloud.discovery.enabled=false",
		"eureka.client.enabled=false",
		"HOST=localhost",
		"PORT=0",
		"RABBITMQ_PORT=5672",
		"RABBITMQ_DEFAULT_USER=guest",
		"RABBITMQ_DEFAULT_PASS=guest",
		"EUREKA_SERVER_URL=http://localhost:8761/eureka/",
		"firebase.enabled=false",
		"vapid.public.key=BOnrlujfRMG5ucNlTsPasMCckJERQRA6S3E9TudLdpEQK8-FhboumN9H10OibSHJ7aP8xrEwnrjz3doeiUZXrfE",
		"vapid.private.key=IUu6njmriPi39MHg2uzyGSso1HruCnGdS7ITNEeGrlw",
		"vapid.subject=mailto:test@volunteerhub.local"
})
class NotificationServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
