package com.lifestack.customrecord.dto;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifestack.customrecord.entity.CustomRecord;
import com.lifestack.customrecord.entity.FieldValue;
import com.lifestack.template.dto.FieldDefinitionResponse;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

public class CustomRecordResponse {

    private UUID id;
    private UUID workspaceId;
    private UUID templateId;
    private String templateName;
    private UUID templateVersionId;
    private int versionNumber;
    private String title;
    private Map<String, Object> fieldValues = new HashMap<>();
    private List<FieldDefinitionResponse> fieldDefinitions = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;

    public CustomRecordResponse() {
    }

    public static CustomRecordResponse fromEntity(CustomRecord record, ObjectMapper objectMapper) {
        CustomRecordResponse dto = new CustomRecordResponse();
        dto.setId(record.getId());
        dto.setWorkspaceId(record.getWorkspace() != null ? record.getWorkspace().getId() : null);
        dto.setTitle(record.getTitle());
        dto.setCreatedAt(record.getCreatedAt());
        dto.setUpdatedAt(record.getUpdatedAt());

        if (record.getTemplateVersion() != null) {
            dto.setTemplateVersionId(record.getTemplateVersion().getId());
            dto.setVersionNumber(record.getTemplateVersion().getVersionNumber());
            if (record.getTemplateVersion().getTemplate() != null) {
                dto.setTemplateId(record.getTemplateVersion().getTemplate().getId());
                dto.setTemplateName(record.getTemplateVersion().getTemplate().getName());
            }

            if (record.getTemplateVersion().getFieldDefinitions() != null) {
                dto.setFieldDefinitions(record.getTemplateVersion().getFieldDefinitions().stream()
                        .map(FieldDefinitionResponse::fromEntity)
                        .collect(Collectors.toList()));
            }
        }

        Map<String, Object> valuesMap = new HashMap<>();
        if (record.getFieldValues() != null) {
            for (FieldValue fv : record.getFieldValues()) {
                if (fv.getFieldDefinition() != null) {
                    String key = fv.getFieldDefinition().getFieldKey();
                    try {
                        Object val = objectMapper.readValue(fv.getValueJson(), Object.class);
                        valuesMap.put(key, val);
                    } catch (Exception e) {
                        valuesMap.put(key, fv.getValueJson());
                    }
                }
            }
        }
        dto.setFieldValues(valuesMap);

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

    public UUID getTemplateId() {
        return templateId;
    }

    public void setTemplateId(UUID templateId) {
        this.templateId = templateId;
    }

    public String getTemplateName() {
        return templateName;
    }

    public void setTemplateName(String templateName) {
        this.templateName = templateName;
    }

    public UUID getTemplateVersionId() {
        return templateVersionId;
    }

    public void setTemplateVersionId(UUID templateVersionId) {
        this.templateVersionId = templateVersionId;
    }

    public int getVersionNumber() {
        return versionNumber;
    }

    public void setVersionNumber(int versionNumber) {
        this.versionNumber = versionNumber;
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
        this.fieldValues = fieldValues;
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

