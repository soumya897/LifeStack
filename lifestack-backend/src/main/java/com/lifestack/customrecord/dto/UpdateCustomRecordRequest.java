package com.lifestack.customrecord.dto;

import jakarta.validation.constraints.Size;

import java.util.Map;

public class UpdateCustomRecordRequest {

    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    private Map<String, Object> fieldValues;

    public UpdateCustomRecordRequest() {
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
}

