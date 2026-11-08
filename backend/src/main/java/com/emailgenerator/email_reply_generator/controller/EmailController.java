package com.emailgenerator.email_reply_generator.controller;

import com.emailgenerator.email_reply_generator.model.EmailRequest;
import com.emailgenerator.email_reply_generator.service.GeminiService;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/email")
public class EmailController {

    private final GeminiService geminiService;

    public EmailController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/generate")
    public String generateReply(@RequestBody EmailRequest request) {
        return geminiService.generateReply(request);
    }
}