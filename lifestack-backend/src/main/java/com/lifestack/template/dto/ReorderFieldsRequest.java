package com.lifestack.template.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.UUID;

public class ReorderFieldsRequest {

    @NotEmpty(message = "Field IDs list cannot be empty")
    private List<UUID> fieldIds;

    public ReorderFieldsRequest() {
    }

    public List<UUID> getFieldIds() {
        return fieldIds;
    }

    public void setFieldIds(List<UUID> fieldIds) {
        this.fieldIds = fieldIds;
    }
}

