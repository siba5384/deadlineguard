package com.deadlineguard.service;

import com.deadlineguard.entity.Task;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

/**
 * Gemini AI service (replaces old Claude mock).
 */
@Service
@Slf4j
public class ClaudeService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final WebClient aiWebClient;

    public ClaudeService(WebClient aiWebClient) {
        this.aiWebClient = aiWebClient;
    }

    // ── SubtaskData DTO ─────────────────────────────────────────────────────
    public static class SubtaskData {
        private final String title;
        private final int estimatedMinutes;
        public SubtaskData(String title, int estimatedMinutes) {
            this.title = title; this.estimatedMinutes = estimatedMinutes;
        }
        public String getTitle()           { return title; }
        public int getEstimatedMinutes()   { return estimatedMinutes; }
        public String title()              { return title; }
        public int estimatedMinutes()      { return estimatedMinutes; }
    }

    // ── ParsedTask DTO ──────────────────────────────────────────────────────
    public static class ParsedTask {
        private final String title;
        private final String type;
        private final int estimatedMinutes;
        public ParsedTask(String title, String type, int estimatedMinutes) {
            this.title = title; this.type = type; this.estimatedMinutes = estimatedMinutes;
        }
        public String getTitle()          { return title; }
        public String getType()           { return type; }
        public int getEstimatedMinutes()  { return estimatedMinutes; }
        public String title()             { return title; }
        public String type()              { return type; }
        public int estimatedMinutes()     { return estimatedMinutes; }
    }

    // ── Core API Caller ─────────────────────────────────────────────────────
    private String callGemini(String prompt) {
        try {
            Map<String, Object> req = new HashMap<>();
            req.put("contents", Collections.singletonList(
                Collections.singletonMap("parts", Collections.singletonList(
                    Collections.singletonMap("text", prompt)
                ))
            ));
            
            // Add instructions to return plain text to avoid markdown wrappers if needed
            Map<String, Object> config = new HashMap<>();
            config.put("temperature", 0.3);
            req.put("generationConfig", config);

            JsonNode response = aiWebClient.post()
                    .uri("?key=" + apiKey)
                    .bodyValue(req)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            if (response != null && response.has("candidates")) {
                return response.get("candidates").get(0).get("content").get("parts").get(0).get("text").asText();
            }
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            log.error("Gemini API Error (Status {}): {}", e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 429) {
                return "RATE_LIMIT_EXCEEDED";
            }
        } catch (Exception e) {
            log.error("Error calling Gemini API: ", e);
        }
        return "";
    }

    // ── Task Decomposition ──────────────────────────────────────────────────
    public List<SubtaskData> decomposeTask(String title, String description, Task.TaskType type) {
        String prompt = "You are a productivity expert. Break down the following task into 3-5 actionable subtasks. " +
                "Task: " + title + "\nDescription: " + (description != null ? description : "") + "\nType: " + type + "\n" +
                "Return EXACTLY in this format, one per line: 'Subtask Title|EstimatedMinutes'. " +
                "Example: Research topic|30\nDo not include any other text, markdown, or headers.";

        String response = callGemini(prompt);
        List<SubtaskData> result = new ArrayList<>();
        
        if (response != null && !response.trim().isEmpty()) {
            String[] lines = response.split("\n");
            for (String line : lines) {
                String[] parts = line.split("\\|");
                if (parts.length == 2) {
                    try {
                        result.add(new SubtaskData(parts[0].trim(), Integer.parseInt(parts[1].trim())));
                    } catch (NumberFormatException ignored) {}
                }
            }
        }
        
        // Fallback if API fails
        if (result.isEmpty()) {
            result.add(new SubtaskData("Start working on " + title, 30));
        }
        return result;
    }

    // ── Nudge Generation ────────────────────────────────────────────────────
    public String generateNudge(String taskTitle, double riskScore, String nextSubtask, long hoursLeft) {
        String prompt = "Write a short, urgent 1-sentence push notification to a user who is procrastinating. " +
                "Task: '" + taskTitle + "'. Next step: '" + nextSubtask + "'. Hours left: " + hoursLeft + ". " +
                "Risk score (out of 100, higher is worse): " + riskScore + ". " +
                "Be encouraging but firm. Do not include quotes around the output.";
        
        String response = callGemini(prompt);
        if (response != null && !response.trim().isEmpty()) {
            return response.trim().replace("\"", "");
        }
        
        // Fallback
        return String.format("🚨 Your task '%s' is due in %d hours! Start '%s' now.", taskTitle, hoursLeft, nextSubtask);
    }

    // ── Auto-Drafter ────────────────────────────────────────────────────────
    public String generateDraft(String taskTitle, String taskDescription, Task.TaskType taskType) {
        String prompt = "Write a comprehensive draft for the following task. Format with Markdown.\n" +
                "Task: " + taskTitle + "\nDescription: " + (taskDescription != null ? taskDescription : "") + "\nType: " + taskType;
        
        String response = callGemini(prompt);
        if (response != null && !response.trim().isEmpty()) {
            return response;
        }
        return "# Draft: " + taskTitle + "\nFailed to generate draft. Please try again.";
    }

    // ── Check-in Parser ─────────────────────────────────────────────────────
    public List<ParsedTask> parseCheckIn(String transcript) {
        String prompt = "Analyze the following user input and extract a list of tasks they need to do. " +
                "Transcript: '" + transcript + "'\n" +
                "Return EXACTLY in this format, one per line: 'Task Title|Type|EstimatedMinutes'. " +
                "Valid Types: GENERAL, EMAIL, DOCUMENT, CODING, STUDY, PRESENTATION. " +
                "Example: Email Professor Smith|EMAIL|15\nDo not include any other text, markdown, or headers.";

        String response = callGemini(prompt);
        List<ParsedTask> result = new ArrayList<>();
        
        if (response != null && !response.trim().isEmpty()) {
            String[] lines = response.split("\n");
            for (String line : lines) {
                String[] parts = line.split("\\|");
                if (parts.length == 3) {
                    try {
                        result.add(new ParsedTask(parts[0].trim(), parts[1].trim(), Integer.parseInt(parts[2].trim())));
                    } catch (NumberFormatException ignored) {}
                }
            }
        }
        
        if (result.isEmpty()) {
            result.add(new ParsedTask(transcript.substring(0, Math.min(transcript.length(), 50)), "GENERAL", 60));
        }
        return result;
    }

    // ── Insight Generator ───────────────────────────────────────────────────
    public String generateInsight(String pattern, double percentage) {
        String prompt = "Write a 1-sentence analytical insight. Pattern: '" + pattern + "', Frequency: " + percentage + "%. " +
                "Provide a brief, actionable tip to improve productivity. Do not use quotes.";
        
        String response = callGemini(prompt);
        if (response != null && !response.trim().isEmpty()) {
            return response.trim().replace("\"", "");
        }
        return String.format("📊 Analysis shows you %s in %.0f%% of cases. Plan ahead to avoid this.", pattern, percentage);
    }

    // ── Generic Chat ────────────────────────────────────────────────────────
    public String chat(String prompt) {
        String fullPrompt = "You are Gemini, a helpful AI productivity assistant for the application 'DeadlineGuard'. " +
            "Be friendly, concise, and offer actionable advice for productivity, time management, and tasks.\n\n" +
            "User message: " + prompt;
            
        String response = callGemini(fullPrompt);
        if ("RATE_LIMIT_EXCEEDED".equals(response)) {
            return "Whoa there! I'm currently rate-limited by the Gemini API free tier (max 15 requests per minute). Please give me about 30 seconds to catch my breath and ask again!";
        }
        if (response != null && !response.trim().isEmpty()) {
            return response;
        }
        return "I'm sorry, I'm having trouble connecting to my neural network right now. Please try again later!";
    }
}
