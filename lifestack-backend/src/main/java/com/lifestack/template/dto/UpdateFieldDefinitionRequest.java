package com.lifestack.template.dto;

import com.lifestack.template.entity.FieldType;
import jakarta.validation.constraints.Size;

public class UpdateFieldDefinitionRequest {

    @Size(max = 200, message = "Label must not exceed 200 characters")
    private String label;

    private FieldType fieldType;

    private Boolean required;

    private String config;

    private Integer sortOrder;

    public UpdateFieldDefinitionRequest() {
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

    public Boolean getRequired() {
        return required;
    }

    public void setRequired(Boolean required) {
        this.required = required;
    }

    public String getConfig() {
        return config;
    }

    public void setConfig(String config) {
        this.config = config;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}

