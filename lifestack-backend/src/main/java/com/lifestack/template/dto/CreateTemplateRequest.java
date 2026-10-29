package com.lifestack.template.dto;

import com.lifestack.template.entity.TemplateRecordType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public class CreateTemplateRequest {

    @NotNull(message = "Workspace ID is required")
    private UUID workspaceId;

    @NotBlank(message = "Template name is required")
    @Size(max = 200, message = "Name must not exceed 200 characters")
    private String name;

    private String description;

    @NotNull(message = "Record type is required")
    private TemplateRecordType recordType = TemplateRecordType.JOB_APPLICATION;

    public CreateTemplateRequest() {
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
}
