package com.lifestack.template.dto;

import com.lifestack.template.entity.TemplateVersion;
import com.lifestack.template.entity.TemplateVersionStatus;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class TemplateVersionResponse {

    private UUID id;
    private UUID templateId;
    private int versionNumber;
    private TemplateVersionStatus status;
    private Instant publishedAt;
    private List<FieldDefinitionResponse> fieldDefinitions = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;

    public TemplateVersionResponse() {
    }

    public static TemplateVersionResponse fromEntity(TemplateVersion version) {
        TemplateVersionResponse dto = new TemplateVersionResponse();
        dto.setId(version.getId());
        dto.setTemplateId(version.getTemplate() != null ? version.getTemplate().getId() : null);
        dto.setVersionNumber(version.getVersionNumber());
        dto.setStatus(version.getStatus());
        dto.setPublishedAt(version.getPublishedAt());
        dto.setCreatedAt(version.getCreatedAt());
        dto.setUpdatedAt(version.getUpdatedAt());

        if (version.getFieldDefinitions() != null) {
            dto.setFieldDefinitions(version.getFieldDefinitions().stream()
                    .map(FieldDefinitionResponse::fromEntity)
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

    public UUID getTemplateId() {
        return templateId;
    }

    public void setTemplateId(UUID templateId) {
        this.templateId = templateId;
    }

    public int getVersionNumber() {
        return versionNumber;
    }

    public void setVersionNumber(int versionNumber) {
        this.versionNumber = versionNumber;
    }

    public TemplateVersionStatus getStatus() {
        return status;
    }

    public void setStatus(TemplateVersionStatus status) {
        this.status = status;
    }

    public Instant getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(Instant publishedAt) {
        this.publishedAt = publishedAt;
    }

    public List<FieldDefinitionResponse> getFieldDefinitions() {
        return fieldDefinitions;
    }

    public void setFieldDefinitions(List<FieldDefinitionResponse> fieldDefinitions) {
        this.fieldDefinitions = fieldDefinitions;
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

