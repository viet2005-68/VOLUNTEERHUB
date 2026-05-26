package com.volunteerhub.common.utils;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class ExportUtils {

    private static final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule())
            .disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        public static <T> byte[] toCsv(String[] headers, List<T> data, Function<T, Object[]> rowMapper) {
            StringBuilder sb = new StringBuilder();

            sb.append('\ufeff');

            // 1. Tạo Header
            sb.append(String.join(",", headers)).append("\r\n");

            // 2. Tạo Data Rows
            for (T item : data) {
                Object[] values = rowMapper.apply(item);
                String row = Stream.of(values)
                        .map(val -> val == null ? "" : "\"" + val.toString().replaceAll("\"", "\"\"") + "\"")
                        .collect(Collectors.joining(","));
                sb.append(row).append("\r\n");
            }

            return sb.toString().getBytes(StandardCharsets.UTF_8);
        }

        public static <T> byte[] toJson(List<T> data) {
            try {
                return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(data);
            } catch (Exception e) {
                throw new RuntimeException("Lỗi xuất JSON", e);
            }
        }
}