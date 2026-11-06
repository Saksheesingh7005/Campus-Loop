import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * Campus Resource Sharing - Java Analytics Service
 *
 * Reads the existing server/src/data/db.json file without modifying it and
 * exposes a small REST endpoint at http://localhost:8081/api/analytics.
 * No third-party Java libraries are required (JDK 11+).
 */
public class ResourceAnalytics {
    private static final int PORT = 8081;
    private static final Path DATA_FILE = Path.of("server", "src", "data", "db.json");

    public static void main(String[] args) throws Exception {
        Path dataPath = args.length > 0 ? Path.of(args[0]) : DATA_FILE;
        if (!Files.exists(dataPath)) {
            System.err.println("Could not find: " + dataPath.toAbsolutePath());
            System.err.println("Run this program from the campus-resource-sharing project root,");
            System.err.println("or pass the path to db.json as the first argument.");
            System.exit(1);
        }

        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/api/analytics", exchange -> handleAnalytics(exchange, dataPath));
        server.createContext("/health", exchange -> send(exchange, 200,
                "{\"status\":\"Java analytics service running\"}"));
        server.setExecutor(null);
        server.start();

        System.out.println("Java Resource Analytics Service is running.");
        System.out.println("Analytics: http://localhost:" + PORT + "/api/analytics");
        System.out.println("Health:    http://localhost:" + PORT + "/health");
        System.out.println("Reading data from: " + dataPath.toAbsolutePath());
    }

    private static void handleAnalytics(HttpExchange exchange, Path dataPath) throws IOException {
        if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            send(exchange, 405, "{\"error\":\"Use GET for this endpoint\"}");
            return;
        }

        try {
            // Read the file on every request so the report reflects the latest app data.
            String json = Files.readString(dataPath, StandardCharsets.UTF_8);
            Object parsed = new JsonParser(json).parse();
            Map<String, Object> database = asMap(parsed);

            List<Object> resources = asList(database.get("resources"));
            List<Object> requests = asList(database.get("requests"));

            int available = 0;
            int borrowed = 0;
            Map<String, Integer> requestStatuses = new TreeMap<>();
            Map<String, Integer> categoryDemand = new TreeMap<>();
            Map<String, Integer> resourceRequestCounts = new LinkedHashMap<>();

            for (Object item : resources) {
                Map<String, Object> resource = asMap(item);
                String id = stringValue(resource.get("id"));
                String availability = stringValue(resource.get("availability"));
                if ("Available".equalsIgnoreCase(availability)) available++;
                if ("Borrowed".equalsIgnoreCase(availability)) borrowed++;
                resourceRequestCounts.put(id, 0);
            }

            for (Object item : requests) {
                Map<String, Object> request = asMap(item);
                String status = stringValue(request.get("status"));
                String category = stringValue(request.get("resourceCategory"));
                String resourceId = stringValue(request.get("resourceId"));

                requestStatuses.merge(status, 1, Integer::sum);
                categoryDemand.merge(category, 1, Integer::sum);
                if (resourceRequestCounts.containsKey(resourceId)) {
                    resourceRequestCounts.merge(resourceId, 1, Integer::sum);
                }
            }

            String mostRequestedCategory = "No requests yet";
            int highestDemand = 0;
            for (Map.Entry<String, Integer> entry : categoryDemand.entrySet()) {
                if (entry.getValue() > highestDemand) {
                    mostRequestedCategory = entry.getKey();
                    highestDemand = entry.getValue();
                }
            }

            List<Map<String, Object>> underutilized = new ArrayList<>();
            for (Object item : resources) {
                Map<String, Object> resource = asMap(item);
                String id = stringValue(resource.get("id"));
                if (resourceRequestCounts.getOrDefault(id, 0) == 0) {
                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("name", resource.get("name"));
                    entry.put("category", resource.get("category"));
                    underutilized.add(entry);
                }
            }

            Map<String, Object> report = new LinkedHashMap<>();
            report.put("service", "Campus Resource Sharing - Java Analytics");
            report.put("totalResources", resources.size());
            report.put("availableResources", available);
            report.put("borrowedResources", borrowed);
            report.put("totalRequests", requests.size());
            report.put("requestStatus", requestStatuses);
            report.put("categoryDemand", categoryDemand);
            report.put("mostRequestedCategory", mostRequestedCategory);
            report.put("mostRequestedCategoryCount", highestDemand);
            report.put("resourcesWithNoRequests", underutilized);

            send(exchange, 200, toJson(report));
        } catch (Exception error) {
            String message = error.getMessage() == null ? "Unable to process project data" : error.getMessage();
            send(exchange, 500, toJson(Map.of("error", message)));
        }
    }

    private static void send(HttpExchange exchange, int status, String body) throws IOException {
        Headers headers = exchange.getResponseHeaders();
        headers.set("Content-Type", "application/json; charset=utf-8");
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
        headers.set("Access-Control-Allow-Headers", "Content-Type");
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(status, bytes.length);
        try (var output = exchange.getResponseBody()) {
            output.write(bytes);
        }
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> asMap(Object value) {
        if (!(value instanceof Map)) throw new IllegalArgumentException("Expected a JSON object in db.json");
        return (Map<String, Object>) value;
    }

    @SuppressWarnings("unchecked")
    private static List<Object> asList(Object value) {
        if (!(value instanceof List)) throw new IllegalArgumentException("Expected a JSON array in db.json");
        return (List<Object>) value;
    }

    private static String stringValue(Object value) {
        return value == null ? "Unknown" : String.valueOf(value);
    }

    private static String toJson(Object value) {
        if (value == null) return "null";
        if (value instanceof String) return "\"" + escapeJson((String) value) + "\"";
        if (value instanceof Number || value instanceof Boolean) return value.toString();
        if (value instanceof Map<?, ?> map) {
            StringBuilder out = new StringBuilder("{");
            boolean first = true;
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                if (!first) out.append(',');
                first = false;
                out.append(toJson(String.valueOf(entry.getKey()))).append(':').append(toJson(entry.getValue()));
            }
            return out.append('}').toString();
        }
        if (value instanceof Iterable<?> items) {
            StringBuilder out = new StringBuilder("[");
            boolean first = true;
            for (Object item : items) {
                if (!first) out.append(',');
                first = false;
                out.append(toJson(item));
            }
            return out.append(']').toString();
        }
        return toJson(String.valueOf(value));
    }

    private static String escapeJson(String value) {
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            switch (c) {
                case '"' -> out.append("\\\"");
                case '\\' -> out.append("\\\\");
                case '\n' -> out.append("\\n");
                case '\r' -> out.append("\\r");
                case '\t' -> out.append("\\t");
                default -> {
                    if (c < 0x20) out.append(String.format("\\u%04x", (int) c));
                    else out.append(c);
                }
            }
        }
        return out.toString();
    }

    /** Small JSON parser so this single-file service has no external dependencies. */
    private static final class JsonParser {
        private final String input;
        private int position = 0;

        JsonParser(String input) { this.input = input; }

        Object parse() {
            Object value = parseValue();
            skipWhitespace();
            if (position != input.length()) throw error("Unexpected content after JSON value");
            return value;
        }

        private Object parseValue() {
            skipWhitespace();
            if (position >= input.length()) throw error("Unexpected end of JSON");
            char c = input.charAt(position);
            if (c == '{') return parseObject();
            if (c == '[') return parseArray();
            if (c == '"') return parseString();
            if (c == 't') return parseLiteral("true", Boolean.TRUE);
            if (c == 'f') return parseLiteral("false", Boolean.FALSE);
            if (c == 'n') return parseLiteral("null", null);
            if (c == '-' || Character.isDigit(c)) return parseNumber();
            throw error("Unexpected character: " + c);
        }

        private Map<String, Object> parseObject() {
            Map<String, Object> result = new LinkedHashMap<>();
            position++;
            skipWhitespace();
            if (take('}')) return result;
            while (true) {
                skipWhitespace();
                if (position >= input.length() || input.charAt(position) != '"') throw error("Expected object key");
                String key = parseString();
                skipWhitespace();
                require(':');
                result.put(key, parseValue());
                skipWhitespace();
                if (take('}')) return result;
                require(',');
            }
        }

        private List<Object> parseArray() {
            List<Object> result = new ArrayList<>();
            position++;
            skipWhitespace();
            if (take(']')) return result;
            while (true) {
                result.add(parseValue());
                skipWhitespace();
                if (take(']')) return result;
                require(',');
            }
        }

        private String parseString() {
            require('"');
            StringBuilder result = new StringBuilder();
            while (position < input.length()) {
                char c = input.charAt(position++);
                if (c == '"') return result.toString();
                if (c == '\\') {
                    if (position >= input.length()) throw error("Incomplete escape sequence");
                    char escaped = input.charAt(position++);
                    switch (escaped) {
                        case '"', '\\', '/' -> result.append(escaped);
                        case 'b' -> result.append('\b');
                        case 'f' -> result.append('\f');
                        case 'n' -> result.append('\n');
                        case 'r' -> result.append('\r');
                        case 't' -> result.append('\t');
                        case 'u' -> {
                            if (position + 4 > input.length()) throw error("Incomplete unicode escape");
                            result.append((char) Integer.parseInt(input.substring(position, position + 4), 16));
                            position += 4;
                        }
                        default -> throw error("Invalid escape sequence");
                    }
                } else {
                    result.append(c);
                }
            }
            throw error("Unterminated string");
        }

        private Object parseNumber() {
            int start = position;
            if (take('-')) { /* sign */ }
            while (position < input.length() && Character.isDigit(input.charAt(position))) position++;
            if (take('.')) while (position < input.length() && Character.isDigit(input.charAt(position))) position++;
            if (position < input.length() && (input.charAt(position) == 'e' || input.charAt(position) == 'E')) {
                position++;
                if (position < input.length() && (input.charAt(position) == '+' || input.charAt(position) == '-')) position++;
                while (position < input.length() && Character.isDigit(input.charAt(position))) position++;
            }
            String number = input.substring(start, position);
            try {
                if (!number.contains(".") && !number.contains("e") && !number.contains("E")) return Long.parseLong(number);
                return Double.parseDouble(number);
            } catch (NumberFormatException ex) {
                throw error("Invalid number");
            }
        }

        private Object parseLiteral(String literal, Object value) {
            if (!input.startsWith(literal, position)) throw error("Invalid literal");
            position += literal.length();
            return value;
        }

        private void skipWhitespace() {
            while (position < input.length() && Character.isWhitespace(input.charAt(position))) position++;
        }

        private boolean take(char expected) {
            if (position < input.length() && input.charAt(position) == expected) {
                position++;
                return true;
            }
            return false;
        }

        private void require(char expected) {
            if (!take(expected)) throw error("Expected '" + expected + "'");
        }

        private IllegalArgumentException error(String message) {
            return new IllegalArgumentException(message + " at character " + position);
        }
    }
}
