package com.lifestack.job.dto;

import com.lifestack.job.entity.ApplicationHistory;
import com.lifestack.job.entity.ApplicationStatus;

import java.time.Instant;
import java.util.UUID;

public class ApplicationHistoryResponse {

    private UUID id;
    private ApplicationStatus fromStatus;
    private ApplicationStatus toStatus;
    private String notes;
    private Instant createdAt;

    public ApplicationHistoryResponse() {
    }

    public static ApplicationHistoryResponse fromEntity(ApplicationHistory h) {
        ApplicationHistoryResponse dto = new ApplicationHistoryResponse();
        dto.setId(h.getId());
        dto.setFromStatus(h.getFromStatus());
        dto.setToStatus(h.getToStatus());
        dto.setNotes(h.getNotes());
        dto.setCreatedAt(h.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public ApplicationStatus getFromStatus() {
        return fromStatus;
    }

    public void setFromStatus(ApplicationStatus fromStatus) {
        this.fromStatus = fromStatus;
    }

    public ApplicationStatus getToStatus() {
        return toStatus;
    }

    public void setToStatus(ApplicationStatus toStatus) {
        this.toStatus = toStatus;
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
}

