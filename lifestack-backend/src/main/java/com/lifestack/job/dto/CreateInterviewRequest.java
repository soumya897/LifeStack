package com.lifestack.job.dto;

import com.lifestack.job.entity.InterviewEventType;
import com.lifestack.job.entity.InterviewResult;
import com.lifestack.job.entity.InterviewStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public class CreateInterviewRequest {

    @NotBlank(message = "Round name is required")
    @Size(max = 100, message = "Round name must not exceed 100 characters")
    private String roundName;

    private InterviewEventType eventType = InterviewEventType.TECHNICAL;

    private Instant scheduledAt;

    private Instant occurredAt;

    private InterviewStatus status = InterviewStatus.SCHEDULED;

    private InterviewResult result = InterviewResult.PENDING;

    private String notes;

    public CreateInterviewRequest() {
    }

    public CreateInterviewRequest(String roundName, InterviewEventType eventType, Instant scheduledAt) {
        this.roundName = roundName;
        this.eventType = eventType != null ? eventType : InterviewEventType.TECHNICAL;
        this.scheduledAt = scheduledAt;
    }

    // Getters and Setters
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
}

