package com.volunteerhub.analyticservice.service;

import com.volunteerhub.analyticservice.dto.EventExportDto;
import com.volunteerhub.analyticservice.dto.RegistrationExportDto;
import com.volunteerhub.analyticservice.dto.UserExportDto;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class ExportService {

    public ByteArrayInputStream exportUsersToCSV(List<UserExportDto> users) {
        String[] HEADERS = {
                "ID", "Name", "Email", "DOB", "Role", "Status",
                "Provider", "Total Events", "Badge Count", "Badges List", "Joined Date"
        };

        return createCSV(HEADERS, (printer) -> {
            for (UserExportDto user : users) {
                printer.printRecord(
                        user.id(),
                        user.name(),
                        user.email(),
                        user.dateOfBirth(),
                        user.role(),
                        user.status(),
                        user.provider(),
                        user.totalEvents(),
                        user.badgeCount(),
                        user.joinedDate()
                );
            }
        });
    }

    public ByteArrayInputStream exportEventsToCSV(List<EventExportDto> events) {
        String[] HEADERS = {
                "ID", "Name", "Owner ID", "Status",
                "Category", "Address", "Start Time", "End Time",
                "Capacity", "Badge Count"
        };

        return createCSV(HEADERS, (printer) -> {
            for (EventExportDto event : events) {
                printer.printRecord(
                        event.id(),
                        event.name(),
                        event.ownerId(),
                        event.status(),
                        event.categoryName(),
                        event.fullAddress(),
                        event.startTime(),
                        event.endTime(),
                        event.capacity(),
                        event.badgeCount()
                );
            }
        });
    }

    public ByteArrayInputStream exportRegistrationsToCSV(List<RegistrationExportDto> regs) {
        String[] HEADERS = {
                "User ID", "Event ID", "Status", "Note", "Registered At"
        };

        return createCSV(HEADERS, (printer) -> {
            for (RegistrationExportDto reg : regs) {
                printer.printRecord(
                        reg.userId(),
                        reg.eventId(),
                        reg.status(),
                        reg.note(),
                        reg.registeredAt()
                );
            }
        });
    }


    @FunctionalInterface
    private interface CsvWriterConsumer {
        void accept(CSVPrinter printer) throws IOException;
    }

    private ByteArrayInputStream createCSV(String[] headers, CsvWriterConsumer consumer) {
        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader(headers)
                .build();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             // Using utf_8 for Vietnam
             OutputStreamWriter streamWriter = new OutputStreamWriter(out, StandardCharsets.UTF_8);
             PrintWriter writer = new PrintWriter(streamWriter);
             CSVPrinter printer = new CSVPrinter(writer, format)) {

            out.write(0xEF);
            out.write(0xBB);
            out.write(0xBF);

            consumer.accept(printer);

            printer.flush();
            return new ByteArrayInputStream(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("Failed to create CSV: " + e.getMessage());
        }
    }
}