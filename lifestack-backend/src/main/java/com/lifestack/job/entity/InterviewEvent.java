package com.lifestack.job.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "interview_events")
public class InterviewEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private JobApplication application;

    @Column(name = "round_name", nullable = false, length = 100)
    private String roundName;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 50)
    private InterviewEventType eventType = InterviewEventType.TECHNICAL;

    @Column(name = "scheduled_at")
    private Instant scheduledAt;

    @Column(name = "occurred_at")
    private Instant occurredAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private InterviewStatus status = InterviewStatus.SCHEDULED;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private InterviewResult result = InterviewResult.PENDING;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public InterviewEvent() {
    }

    public InterviewEvent(JobApplication application, String roundName, InterviewEventType eventType,
                          Instant scheduledAt, Instant occurredAt, InterviewStatus status,
                          InterviewResult result, String notes) {
        this.application = application;
        this.roundName = roundName;
        this.eventType = eventType != null ? eventType : InterviewEventType.TECHNICAL;
        this.scheduledAt = scheduledAt;
        this.occurredAt = occurredAt;
        this.status = status != null ? status : InterviewStatus.SCHEDULED;
        this.result = result != null ? result : InterviewResult.PENDING;
        this.notes = notes;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public JobApplication getApplication() {
        return application;
    }

    public void setApplication(JobApplication application) {
        this.application = application;
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

