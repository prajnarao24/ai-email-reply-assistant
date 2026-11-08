package com.emailgenerator.email_reply_generator.service;

import com.emailgenerator.email_reply_generator.model.EmailRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.*;

@Service
public class GeminiService {

    private final RestClient restClient = RestClient.create();

    @Value("${gemini.api.url}")
    private String apiUrl;

    @Value("${gemini.api.key}")
    private String apiKey;



    public String generateReply(EmailRequest request) {
        String prompt = "Write a " + request.getTone() + " email reply, "
                + request.getLength() + " length, to this email:\n"
                + request.getEmailContent();

        if (request.getEmailContent() == null || request.getEmailContent().isBlank()) {
            throw new IllegalArgumentException("Email content must not be empty");
        }
        if (request.getEmailContent().length() > 5000) {
            throw new IllegalArgumentException("Email content must be at most 5000 characters");
        }
        if (request.getTone() == null
                || !List.of("professional", "friendly", "formal", "casual").contains(request.getTone())) {
            throw new IllegalArgumentException("Tone must be professional, friendly, formal or casual");
        }
        if (request.getLength() == null
                || !List.of("short", "medium", "detailed").contains(request.getLength())) {
            throw new IllegalArgumentException("Length must be short, medium or detailed");
        }
        if (request.getExtraInstruction() != null && request.getExtraInstruction().length() > 300) {
            throw new IllegalArgumentException("Extra instruction must be at most 300 characters");
        }


        if (request.getExtraInstruction() != null && !request.getExtraInstruction().isBlank()) {
            prompt += "\nAlso follow this instruction from the user: "
                    + request.getExtraInstruction();
        }
        prompt += "\nReturn only the reply text.";
        Map<String, Object> body = Map.of("contents",
                List.of(Map.of("parts", List.of(Map.of("text", prompt)))));

        Map<?, ?> response = restClient.post()
                .uri(apiUrl)
                .header("x-goog-api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(Map.class);

        List<?> candidates = (List<?>) response.get("candidates");
        Map<?, ?> content = (Map<?, ?>) ((Map<?, ?>) candidates.get(0)).get("content");
        List<?> parts = (List<?>) content.get("parts");
        return (String) ((Map<?, ?>) parts.get(0)).get("text");
    }
}