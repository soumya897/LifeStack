package com.lifestack.template.dto;

import jakarta.validation.constraints.Size;

public class UpdateTemplateRequest {

    @Size(max = 200, message = "Name must not exceed 200 characters")
    private String name;

    private String description;

    public UpdateTemplateRequest() {
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
}
