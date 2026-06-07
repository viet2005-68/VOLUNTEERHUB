package com.volunteerhub.donationservice;

import com.volunteerhub.donationservice.dto.CreateMockDonationRequest;
import com.volunteerhub.donationservice.dto.CreatePayoutRequest;
import com.volunteerhub.donationservice.dto.ReviewPayoutRequest;
import com.volunteerhub.donationservice.model.PayoutStatus;
import com.volunteerhub.donationservice.service.DonationService;
import com.volunteerhub.donationservice.service.PayoutService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:donation-test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "eureka.client.enabled=false"
})
class DonationServiceApplicationTests {

    @Autowired
    private DonationService donationService;

    @Autowired
    private PayoutService payoutService;

    @Test
    void mockDonationCreditsManagerBalanceAndPayoutLifecycleUpdatesBuckets() {
        CreateMockDonationRequest donationRequest = new CreateMockDonationRequest();
        donationRequest.setManagerId("manager-1");
        donationRequest.setClientDonationId("mobile-donation-1");
        donationRequest.setAmountVnd(100_000L);
        donationRequest.setMessage("Keep going");

        donationService.createSuccessfulMockDonation("donor-1", donationRequest);
        donationService.createSuccessfulMockDonation("donor-1", donationRequest);

        var balance = donationService.getManagerBalance("manager-1", "MANAGER", "manager-1");
        assertThat(balance.getTotalReceivedVnd()).isEqualTo(100_000L);
        assertThat(balance.getAvailableVnd()).isEqualTo(100_000L);

        CreatePayoutRequest payoutRequest = new CreatePayoutRequest();
        payoutRequest.setAmountVnd(60_000L);
        payoutRequest.setMomoWalletPhone("0912345678");
        payoutRequest.setWalletHolderName("Nguyen Van A");

        var payout = payoutService.createPayoutRequest("manager-1", payoutRequest);
        assertThat(payout.getStatus()).isEqualTo(PayoutStatus.PENDING);

        balance = donationService.getManagerBalance("manager-1", "MANAGER", "manager-1");
        assertThat(balance.getPendingPayoutVnd()).isEqualTo(60_000L);
        assertThat(balance.getAvailableVnd()).isEqualTo(40_000L);

        ReviewPayoutRequest reviewRequest = new ReviewPayoutRequest();
        reviewRequest.setAdminNote("Missing payout evidence");
        payoutService.rejectPayoutRequest("admin-1", payout.getId(), reviewRequest);

        balance = donationService.getManagerBalance("manager-1", "MANAGER", "manager-1");
        assertThat(balance.getPendingPayoutVnd()).isZero();
        assertThat(balance.getAvailableVnd()).isEqualTo(100_000L);

        payout = payoutService.createPayoutRequest("manager-1", payoutRequest);
        reviewRequest.setProviderReference("momo-transfer-1");
        payoutService.completePayoutRequest("admin-1", payout.getId(), reviewRequest);

        balance = donationService.getManagerBalance("manager-1", "MANAGER", "manager-1");
        assertThat(balance.getPendingPayoutVnd()).isZero();
        assertThat(balance.getPaidOutVnd()).isEqualTo(60_000L);
        assertThat(balance.getAvailableVnd()).isEqualTo(40_000L);
    }

    @Test
    void payoutCannotExceedAvailableBalance() {
        CreatePayoutRequest payoutRequest = new CreatePayoutRequest();
        payoutRequest.setAmountVnd(20_000L);
        payoutRequest.setMomoWalletPhone("0912345678");
        payoutRequest.setWalletHolderName("Nguyen Van A");

        assertThatThrownBy(() -> payoutService.createPayoutRequest("manager-empty", payoutRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("exceeds available balance");
    }
}
