package com.lifestack.customrecord.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class CreateCustomRecordRequest {

    @NotNull(message = "Workspace ID is required")
    private UUID workspaceId;

    @NotNull(message = "Template Version ID is required")
    private UUID templateVersionId;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    private Map<String, Object> fieldValues = new HashMap<>();

    public CreateCustomRecordRequest() {
    }

    public UUID getWorkspaceId() {
        return workspaceId;
    }

    public void setWorkspaceId(UUID workspaceId) {
        this.workspaceId = workspaceId;
    }

    public UUID getTemplateVersionId() {
        return templateVersionId;
    }

    public void setTemplateVersionId(UUID templateVersionId) {
        this.templateVersionId = templateVersionId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Map<String, Object> getFieldValues() {
        return fieldValues;
    }

    public void setFieldValues(Map<String, Object> fieldValues) {
        this.fieldValues = fieldValues != null ? fieldValues : new HashMap<>();
    }
}

