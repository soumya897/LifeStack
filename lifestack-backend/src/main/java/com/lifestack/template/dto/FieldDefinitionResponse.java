package com.lifestack.template.dto;

import com.lifestack.template.entity.FieldDefinition;
import com.lifestack.template.entity.FieldType;

import java.time.Instant;
import java.util.UUID;

public class FieldDefinitionResponse {

    private UUID id;
    private UUID versionId;
    private String fieldKey;
    private String label;
    private FieldType fieldType;
    private boolean required;
    private String config;
    private int sortOrder;
    private Instant createdAt;

    public FieldDefinitionResponse() {
    }

    public static FieldDefinitionResponse fromEntity(FieldDefinition def) {
        FieldDefinitionResponse dto = new FieldDefinitionResponse();
        dto.setId(def.getId());
        dto.setVersionId(def.getVersion() != null ? def.getVersion().getId() : null);
        dto.setFieldKey(def.getFieldKey());
        dto.setLabel(def.getLabel());
        dto.setFieldType(def.getFieldType());
        dto.setRequired(def.isRequired());
        dto.setConfig(def.getConfig());
        dto.setSortOrder(def.getSortOrder());
        dto.setCreatedAt(def.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getVersionId() {
        return versionId;
    }

    public void setVersionId(UUID versionId) {
        this.versionId = versionId;
    }

    public String getFieldKey() {
        return fieldKey;
    }

    public void setFieldKey(String fieldKey) {
        this.fieldKey = fieldKey;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public FieldType getFieldType() {
        return fieldType;
    }

    public void setFieldType(FieldType fieldType) {
        this.fieldType = fieldType;
    }

    public boolean isRequired() {
        return required;
    }

    public void setRequired(boolean required) {
        this.required = required;
    }

    public String getConfig() {
        return config;
    }

    public void setConfig(String config) {
        this.config = config;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

