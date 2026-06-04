package com.volunteerhub.AggregationService;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"server.port=0",
		"spring.cloud.discovery.enabled=false",
		"eureka.client.enabled=false",
		"PORT=0",
		"EUREKA_SERVER_URL=http://localhost:8761/eureka/"
})
class AggregationServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
