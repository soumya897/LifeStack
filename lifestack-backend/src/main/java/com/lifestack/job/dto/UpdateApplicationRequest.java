package com.lifestack.job.dto;

import com.lifestack.job.entity.ApplicationStatus;
import com.lifestack.job.entity.WorkMode;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

public class UpdateApplicationRequest {

    @Size(max = 200, message = "Company name must not exceed 200 characters")
    private String companyName;

    @Size(max = 200, message = "Job title must not exceed 200 characters")
    private String jobTitle;

    @Size(max = 100, message = "Source must not exceed 100 characters")
    private String source;

    private String jobUrl;

    private LocalDate appliedAt;

    private ApplicationStatus status;

    @Size(max = 150, message = "Location must not exceed 150 characters")
    private String location;

    private WorkMode workMode;

    @Size(max = 100, message = "Salary must not exceed 100 characters")
    private String salary;

    private String notes;

    private LocalDate followUpAt;

    private String statusChangeNote;

    public UpdateApplicationRequest() {
    }

    // Getters and Setters
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

    public String getStatusChangeNote() {
        return statusChangeNote;
    }

    public void setStatusChangeNote(String statusChangeNote) {
        this.statusChangeNote = statusChangeNote;
    }
}

