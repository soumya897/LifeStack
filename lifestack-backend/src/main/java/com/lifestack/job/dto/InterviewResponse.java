package com.lifestack.job.dto;

import com.lifestack.job.entity.InterviewEvent;
import com.lifestack.job.entity.InterviewEventType;
import com.lifestack.job.entity.InterviewResult;
import com.lifestack.job.entity.InterviewStatus;

import java.time.Instant;
import java.util.UUID;

public class InterviewResponse {

    private UUID id;
    private UUID applicationId;
    private String companyName;
    private String roundName;
    private InterviewEventType eventType;
    private Instant scheduledAt;
    private Instant occurredAt;
    private InterviewStatus status;
    private InterviewResult result;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;

    public InterviewResponse() {
    }

    public static InterviewResponse fromEntity(InterviewEvent event) {
        InterviewResponse dto = new InterviewResponse();
        dto.setId(event.getId());
        dto.setApplicationId(event.getApplication() != null ? event.getApplication().getId() : null);
        dto.setCompanyName(event.getApplication() != null ? event.getApplication().getCompanyName() : null);
        dto.setRoundName(event.getRoundName());
        dto.setEventType(event.getEventType());
        dto.setScheduledAt(event.getScheduledAt());
        dto.setOccurredAt(event.getOccurredAt());
        dto.setStatus(event.getStatus());
        dto.setResult(event.getResult());
        dto.setNotes(event.getNotes());
        dto.setCreatedAt(event.getCreatedAt());
        dto.setUpdatedAt(event.getUpdatedAt());
        return dto;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(UUID applicationId) {
        this.applicationId = applicationId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getRoundName() {
        return roundName;
    }

    public void setRoundName(String roundName) {
        this.roundName = roundName;
    }

    public InterviewEventType getEventType() {
        return eventType;
    }

    public void setEventType(InterviewEventType eventType) {
        this.eventType = eventType;
    }

    public Instant getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(Instant scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public Instant getOccurredAt() {
        return occurredAt;
    }

    public void setOccurredAt(Instant occurredAt) {
        this.occurredAt = occurredAt;
    }

    public InterviewStatus getStatus() {
        return status;
    }

    public void setStatus(InterviewStatus status) {
        this.status = status;
    }

    public InterviewResult getResult() {
        return result;
    }

    public void setResult(InterviewResult result) {
        this.result = result;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}

