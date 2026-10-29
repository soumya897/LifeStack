package com.lifestack.template.dto;

import com.lifestack.template.entity.Template;
import com.lifestack.template.entity.TemplateRecordType;
import com.lifestack.template.entity.TemplateVersion;
import com.lifestack.template.entity.TemplateVersionStatus;

import java.time.Instant;
import java.util.UUID;

public class TemplateResponse {

    private UUID id;
    private UUID workspaceId;
    private String name;
    private String description;
    private TemplateRecordType recordType;
    private int latestVersionNumber;
    private UUID publishedVersionId;
    private int publishedVersionNumber;
    private int versionsCount;
    private Instant createdAt;
    private Instant updatedAt;

    public TemplateResponse() {
    }

    public static TemplateResponse fromEntity(Template template) {
        TemplateResponse dto = new TemplateResponse();
        dto.setId(template.getId());
        dto.setWorkspaceId(template.getWorkspace() != null ? template.getWorkspace().getId() : null);
        dto.setName(template.getName());
        dto.setDescription(template.getDescription());
        dto.setRecordType(template.getRecordType());
        dto.setCreatedAt(template.getCreatedAt());
        dto.setUpdatedAt(template.getUpdatedAt());

        if (template.getVersions() != null && !template.getVersions().isEmpty()) {
            dto.setVersionsCount(template.getVersions().size());
            TemplateVersion latest = template.getVersions().get(0);
            dto.setLatestVersionNumber(latest.getVersionNumber());

            template.getVersions().stream()
                    .filter(v -> v.getStatus() == TemplateVersionStatus.PUBLISHED)
                    .findFirst()
                    .ifPresent(pub -> {
                        dto.setPublishedVersionId(pub.getId());
                        dto.setPublishedVersionNumber(pub.getVersionNumber());
                    });
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TemplateRecordType getRecordType() {
        return recordType;
    }

    public void setRecordType(TemplateRecordType recordType) {
        this.recordType = recordType;
    }

    public int getLatestVersionNumber() {
        return latestVersionNumber;
    }

    public void setLatestVersionNumber(int latestVersionNumber) {
        this.latestVersionNumber = latestVersionNumber;
    }

    public UUID getPublishedVersionId() {
        return publishedVersionId;
    }

    public void setPublishedVersionId(UUID publishedVersionId) {
        this.publishedVersionId = publishedVersionId;
    }

    public int getPublishedVersionNumber() {
        return publishedVersionNumber;
    }

    public void setPublishedVersionNumber(int publishedVersionNumber) {
        this.publishedVersionNumber = publishedVersionNumber;
    }

    public int getVersionsCount() {
        return versionsCount;
    }

    public void setVersionsCount(int versionsCount) {
        this.versionsCount = versionsCount;
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

