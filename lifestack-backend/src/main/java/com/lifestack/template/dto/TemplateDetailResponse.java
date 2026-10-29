package com.lifestack.template.dto;

import com.lifestack.template.entity.Template;
import com.lifestack.template.entity.TemplateRecordType;
import com.lifestack.template.entity.TemplateVersion;
import com.lifestack.template.entity.TemplateVersionStatus;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class TemplateDetailResponse {

    private UUID id;
    private UUID workspaceId;
    private String name;
    private String description;
    private TemplateRecordType recordType;
    private List<TemplateVersionResponse> versions = new ArrayList<>();
    private TemplateVersionResponse activeVersion;
    private Instant createdAt;
    private Instant updatedAt;

    public TemplateDetailResponse() {
    }

    public static TemplateDetailResponse fromEntity(Template template) {
        TemplateDetailResponse dto = new TemplateDetailResponse();
        dto.setId(template.getId());
        dto.setWorkspaceId(template.getWorkspace() != null ? template.getWorkspace().getId() : null);
        dto.setName(template.getName());
        dto.setDescription(template.getDescription());
        dto.setRecordType(template.getRecordType());
        dto.setCreatedAt(template.getCreatedAt());
        dto.setUpdatedAt(template.getUpdatedAt());

        if (template.getVersions() != null && !template.getVersions().isEmpty()) {
            dto.setVersions(template.getVersions().stream()
                    .map(TemplateVersionResponse::fromEntity)
                    .collect(Collectors.toList()));

            // Find the active version: either latest published or latest draft
            TemplateVersion active = template.getVersions().stream()
                    .filter(v -> v.getStatus() == TemplateVersionStatus.PUBLISHED)
                    .findFirst()
                    .orElse(template.getVersions().get(0));

            dto.setActiveVersion(TemplateVersionResponse.fromEntity(active));
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

    public List<TemplateVersionResponse> getVersions() {
        return versions;
    }

    public void setVersions(List<TemplateVersionResponse> versions) {
        this.versions = versions;
    }

    public TemplateVersionResponse getActiveVersion() {
        return activeVersion;
    }

    public void setActiveVersion(TemplateVersionResponse activeVersion) {
        this.activeVersion = activeVersion;
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
