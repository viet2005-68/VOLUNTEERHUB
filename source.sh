cd AuthorizationServer &&
docker exec -t cd8d52815b61 pg_dump -U admin users > backup_as.sql &&
cd ../CommunityService &&
docker exec -t 6c12c4fe78f9 pg_dump -U admin community > backup_com.sql &&
cd ../EventService &&
docker exec -t 2213fecb91aa pg_dump -U admin events > backup_ev.sql &&
cd ../NotificationService &&
docker exec -t 1196d4cfdb41 pg_dump -U admin notifications > backup_not.sql &&
cd ../RegistrationService &&
docker exec -t 65903224a0b0 pg_dump -U admin registrations > backup_reg.sql &&
cd ../UserService &&
docker exec -t 19f9523b192f pg_dump -U admin users > backup_user.sql &&
cd ..