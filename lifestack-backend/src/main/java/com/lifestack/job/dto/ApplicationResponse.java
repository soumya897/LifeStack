package com.lifestack.job.dto;

import com.lifestack.job.entity.ApplicationStatus;
import com.lifestack.job.entity.JobApplication;
import com.lifestack.job.entity.WorkMode;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class ApplicationResponse {

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
    private int interviewRoundsCount;
    private Instant createdAt;
    private Instant updatedAt;

    public ApplicationResponse() {
    }

    public static ApplicationResponse fromEntity(JobApplication app) {
        ApplicationResponse dto = new ApplicationResponse();
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
        dto.setInterviewRoundsCount(app.getInterviews() != null ? app.getInterviews().size() : 0);
        dto.setCreatedAt(app.getCreatedAt());
        dto.setUpdatedAt(app.getUpdatedAt());

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

    public int getInterviewRoundsCount() {
        return interviewRoundsCount;
    }

    public void setInterviewRoundsCount(int interviewRoundsCount) {
        this.interviewRoundsCount = interviewRoundsCount;
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
