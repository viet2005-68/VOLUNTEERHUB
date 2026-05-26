package com.volunteerhub.registrationservice;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Context smoke test requires a local PostgreSQL instance; service behavior is covered by focused unit tests.")
class RegistrationServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
