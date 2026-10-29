package com.lifestack.job.dto;

import com.lifestack.job.entity.ApplicationStatus;
import com.lifestack.job.entity.JobApplication;
import com.lifestack.job.entity.WorkMode;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class ApplicationDetailResponse {

    private UUID id;
    private UUID workspaceId;
    private String companyName;
    private String jobTitle;
    private String source;
    private String jobUrl;
    private LocalDate appliedAt;
    private ApplicationStatus status;
    private String location;
    private WorkMode workMode;
    private String salary;
    private String notes;
    private LocalDate followUpAt;
    private Instant createdAt;
    private Instant updatedAt;

    private List<InterviewResponse> interviews = new ArrayList<>();
    private List<ApplicationHistoryResponse> history = new ArrayList<>();
    private List<UUID> attachedNoteIds = new ArrayList<>();

    public ApplicationDetailResponse() {
    }

    public static ApplicationDetailResponse fromEntity(JobApplication app) {
        ApplicationDetailResponse dto = new ApplicationDetailResponse();
        dto.setId(app.getId());
        dto.setWorkspaceId(app.getWorkspace() != null ? app.getWorkspace().getId() : null);
        dto.setCompanyName(app.getCompanyName());
        dto.setJobTitle(app.getJobTitle());
        dto.setSource(app.getSource());
        dto.setJobUrl(app.getJobUrl());
        dto.setAppliedAt(app.getAppliedAt());
        dto.setStatus(app.getStatus());
        dto.setLocation(app.getLocation());
        dto.setWorkMode(app.getWorkMode());
        dto.setSalary(app.getSalary());
        dto.setNotes(app.getNotes());
        dto.setFollowUpAt(app.getFollowUpAt());
        dto.setCreatedAt(app.getCreatedAt());
        dto.setUpdatedAt(app.getUpdatedAt());

        if (app.getInterviews() != null) {
            dto.setInterviews(app.getInterviews().stream()
                    .map(InterviewResponse::fromEntity)
                    .collect(Collectors.toList()));
        }

        if (app.getHistory() != null) {
            dto.setHistory(app.getHistory().stream()
                    .map(ApplicationHistoryResponse::fromEntity)
                    .collect(Collectors.toList()));
        }

        if (app.getAttachedNotes() != null) {
            dto.setAttachedNoteIds(app.getAttachedNotes().stream()
                    .map(n -> n.getId())
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getWorkspaceId() {
        return workspaceId;
    }

    public void setWorkspaceId(UUID workspaceId) {
        this.workspaceId = workspaceId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getJobUrl() {
        return jobUrl;
    }

    public void setJobUrl(String jobUrl) {
        this.jobUrl = jobUrl;
    }

    public LocalDate getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(LocalDate appliedAt) {
        this.appliedAt = appliedAt;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public WorkMode getWorkMode() {
        return workMode;
    }

    public void setWorkMode(WorkMode workMode) {
        this.workMode = workMode;
    }

    public String getSalary() {
        return salary;
    }

    public void setSalary(String salary) {
        this.salary = salary;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDate getFollowUpAt() {
        return followUpAt;
    }

    public void setFollowUpAt(LocalDate followUpAt) {
        this.followUpAt = followUpAt;
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

    public List<InterviewResponse> getInterviews() {
        return interviews;
    }

    public void setInterviews(List<InterviewResponse> interviews) {
        this.interviews = interviews;
    }

    public List<ApplicationHistoryResponse> getHistory() {
        return history;
    }

    public void setHistory(List<ApplicationHistoryResponse> history) {
        this.history = history;
    }

    public List<UUID> getAttachedNoteIds() {
        return attachedNoteIds;
    }

    public void setAttachedNoteIds(List<UUID> attachedNoteIds) {
        this.attachedNoteIds = attachedNoteIds;
    }
}

