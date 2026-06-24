package com.deadlineguard.service;

import com.deadlineguard.entity.Task;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class GoogleCalendarService {

    private final WebClient webClient;

    public GoogleCalendarService() {
        this.webClient = WebClient.builder()
                .baseUrl("https://www.googleapis.com/calendar/v3")
                .build();
    }

    /**
     * Syncs a task to Google Calendar using the provided OAuth2 access token.
     * Returns the created event ID or null if failed.
     */
    public String syncTaskToCalendar(Task task, String accessToken) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("summary", "[DeadlineGuard] " + task.getTitle());
            event.put("description", task.getDescription() != null ? task.getDescription() : "");
            
            // Format dates according to RFC3339 which Calendar API expects
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX");
            String endDateTime = task.getDeadline().atZone(ZoneId.systemDefault()).format(formatter);
            String startDateTime = task.getDeadline().minusMinutes(task.getEstimatedEffortMinutes()).atZone(ZoneId.systemDefault()).format(formatter);

            event.put("start", createDateTimeMap(startDateTime));
            event.put("end", createDateTimeMap(endDateTime));

            JsonNode response = webClient.post()
                    .uri("/calendars/primary/events")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(event)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            if (response != null && response.has("id")) {
                return response.get("id").asText();
            }
        } catch (Exception e) {
            log.error("Failed to sync task to Google Calendar: ", e);
        }
        return null;
    }

    private Map<String, String> createDateTimeMap(String dateTime) {
        Map<String, String> map = new HashMap<>();
        map.put("dateTime", dateTime);
        return map;
    }
}
