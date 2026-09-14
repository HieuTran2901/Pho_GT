package com.pho1986.backend.dto;

import java.util.Map;

public class ChatResponseDto {

    private String reply;
    private String actionType; // "DISH", "BOOKING", "VOUCHER", "MENU", "NONE"
    private Map<String, Object> actionPayload;
    private boolean fallback;

    public ChatResponseDto() {
    }

    public ChatResponseDto(String reply, String actionType, Map<String, Object> actionPayload, boolean fallback) {
        this.reply = reply;
        this.actionType = actionType;
        this.actionPayload = actionPayload;
        this.fallback = fallback;
    }

    public static ChatResponseDto of(String reply) {
        return new ChatResponseDto(reply, "NONE", null, false);
    }

    public static ChatResponseDto of(String reply, String actionType, Map<String, Object> actionPayload, boolean fallback) {
        return new ChatResponseDto(reply, actionType, actionPayload, fallback);
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public Map<String, Object> getActionPayload() {
        return actionPayload;
    }

    public void setActionPayload(Map<String, Object> actionPayload) {
        this.actionPayload = actionPayload;
    }

    public boolean isFallback() {
        return fallback;
    }

    public void setFallback(boolean fallback) {
        this.fallback = fallback;
    }
}
