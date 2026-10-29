package com.lifestack.job.dto;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifestack.job.entity.ApplicationStatus;
import com.lifestack.job.entity.JobApplication;
import com.lifestack.job.entity.WorkMode;
import com.lifestack.template.dto.FieldDefinitionResponse;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

public class ApplicationDetailResponse {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private UUID id;
    private UUID workspaceId;
    private UUID templateVersionId;
    private String templateName;
    private Integer templateVersionNumber;
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
    private Map<String, Object> customFields = new HashMap<>();
    private List<FieldDefinitionResponse> fieldDefinitions = new ArrayList<>();
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

        if (app.getTemplateVersion() != null) {
            dto.setTemplateVersionId(app.getTemplateVersion().getId());
            dto.setTemplateVersionNumber(app.getTemplateVersion().getVersionNumber());
            if (app.getTemplateVersion().getTemplate() != null) {
                dto.setTemplateName(app.getTemplateVersion().getTemplate().getName());
            }

            if (app.getTemplateVersion().getFieldDefinitions() != null) {
                dto.setFieldDefinitions(app.getTemplateVersion().getFieldDefinitions().stream()
                        .map(FieldDefinitionResponse::fromEntity)
                        .collect(Collectors.toList()));
            }
        }

        if (app.getCustomFields() != null && !app.getCustomFields().trim().isEmpty()) {
            try {
                dto.setCustomFields(MAPPER.readValue(app.getCustomFields(), new TypeReference<Map<String, Object>>() {}));
            } catch (Exception e) {
                dto.setCustomFields(Collections.emptyMap());
            }
        }

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

    public UUID getTemplateVersionId() {
        return templateVersionId;
    }

    public void setTemplateVersionId(UUID templateVersionId) {
        this.templateVersionId = templateVersionId;
    }

    public String getTemplateName() {
        return templateName;
    }

    public void setTemplateName(String templateName) {
        this.templateName = templateName;
    }

    public Integer getTemplateVersionNumber() {
        return templateVersionNumber;
    }

    public void setTemplateVersionNumber(Integer templateVersionNumber) {
        this.templateVersionNumber = templateVersionNumber;
    }

    public Map<String, Object> getCustomFields() {
        return customFields;
    }

    public void setCustomFields(Map<String, Object> customFields) {
        this.customFields = customFields != null ? customFields : new HashMap<>();
    }

    public List<FieldDefinitionResponse> getFieldDefinitions() {
        return fieldDefinitions;
    }

    public void setFieldDefinitions(List<FieldDefinitionResponse> fieldDefinitions) {
        this.fieldDefinitions = fieldDefinitions;
    }
}

