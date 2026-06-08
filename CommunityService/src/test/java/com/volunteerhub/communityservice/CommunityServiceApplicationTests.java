package com.volunteerhub.communityservice;

import com.google.cloud.storage.Storage;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest(properties = {
		"server.port=0",
		"spring.datasource.url=jdbc:h2:mem:communityservice_test;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
		"spring.datasource.driver-class-name=org.h2.Driver",
		"spring.jpa.hibernate.ddl-auto=create-drop",
		"spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
		"spring.data.redis.host=localhost",
		"spring.data.redis.port=6379",
		"spring.data.redis.password=",
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
		"REDIS_PORT=6379",
		"REDIS_PASSWORD=",
		"RABBITMQ_PORT=5672",
		"RABBITMQ_DEFAULT_USER=guest",
		"RABBITMQ_DEFAULT_PASS=guest",
		"EUREKA_SERVER_URL=http://localhost:8761/eureka/",
		"rabbitmq.exchange.notification=notification-exchange",
		"rabbitmq.routingKey.comment=notification.comment",
		"rabbitmq.routingKey.reaction=notification.reaction",
		"rabbitmq.routingKey.post=notification.post",
		"firebase.projectId=",
		"firebase.storage.bucket=",
		"firebase.credentials.location=",
		"firebase.credentials.base64="
})
class CommunityServiceApplicationTests {

	@MockBean
	private Storage storage;

	@Test
	void contextLoads() {
	}

}
