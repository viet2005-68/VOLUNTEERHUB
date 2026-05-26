docker compose up -d &&
cd AuthorizationServer &&
docker compose up -d &&
cd ../CommunityService &&
docker compose up -d &&
cd ../EventService &&
docker compose up -d &&
cd ../NotificationService &&
docker compose up -d &&
cd ../ChatService &&
docker compose up -d &&
cd ../RegistrationService &&
docker compose up -d &&
cd ../UserService &&
docker compose up -d &&
cd ..
