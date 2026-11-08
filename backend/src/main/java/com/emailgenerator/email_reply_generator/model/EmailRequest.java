package com.emailgenerator.email_reply_generator.model;

public class EmailRequest {

    private String emailContent;
    private String tone;
    private String length;
    private String extraInstruction; // optional

    public String getEmailContent() { return emailContent; }
    public void setEmailContent(String emailContent) { this.emailContent = emailContent; }

    public String getTone() { return tone; }
    public void setTone(String tone) { this.tone = tone; }

    public String getLength() { return length; }
    public void setLength(String length) { this.length = length; }

    public String getExtraInstruction() { return extraInstruction; }
    public void setExtraInstruction(String extraInstruction) { this.extraInstruction = extraInstruction; }
}