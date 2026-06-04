package com.volunteerhub.analyticservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"server.port=0",
		"spring.data.redis.host=localhost",
		"spring.data.redis.port=6379",
		"spring.data.redis.password=",
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
		"EUREKA_SERVER_URL=http://localhost:8761/eureka/"
})
class AnalyticServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
