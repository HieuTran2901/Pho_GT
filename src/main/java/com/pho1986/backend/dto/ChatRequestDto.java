package com.pho1986.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public class ChatRequestDto {

    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    @Size(max = 500, message = "Nội dung tin nhắn tối đa 500 ký tự")
    private String message;

    private String sessionId;

    private List<ChatMessageHistoryDto> history;

    public ChatRequestDto() {
    }

    public ChatRequestDto(String message, String sessionId, List<ChatMessageHistoryDto> history) {
        this.message = message;
        this.sessionId = sessionId;
        this.history = history;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public List<ChatMessageHistoryDto> getHistory() {
        return history;
    }

    public void setHistory(List<ChatMessageHistoryDto> history) {
        this.history = history;
    }

    public static class ChatMessageHistoryDto {
        private String role; // "user" hoặc "assistant"
        private String content;

        public ChatMessageHistoryDto() {}

        public ChatMessageHistoryDto(String role, String content) {
            this.role = role;
            this.content = content;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }
}
