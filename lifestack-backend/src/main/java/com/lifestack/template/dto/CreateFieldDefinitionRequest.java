package com.lifestack.template.dto;

import com.lifestack.template.entity.FieldType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CreateFieldDefinitionRequest {

    @NotBlank(message = "Field key is required")
    @Pattern(regexp = "^[a-z0-9_]+$", message = "Field key must be lowercase alphanumeric and underscores only (e.g. recruiter_email)")
    @Size(max = 100, message = "Field key must not exceed 100 characters")
    private String fieldKey;

    @NotBlank(message = "Label is required")
    @Size(max = 200, message = "Label must not exceed 200 characters")
    private String label;

    @NotNull(message = "Field type is required")
    private FieldType fieldType;

    private boolean required = false;

    private String config = "{}";

    private int sortOrder = 0;

    public CreateFieldDefinitionRequest() {
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
        this.config = config != null ? config : "{}";
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }
}

