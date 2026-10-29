package com.lifestack.workspace.dto;

import jakarta.validation.constraints.Size;

public class UpdateWorkspaceRequest {

    @Size(min = 1, max = 100, message = "Workspace name must be between 1 and 100 characters")
    private String name;

    private String description;

    private String settings;

    public UpdateWorkspaceRequest() {
    }

    public UpdateWorkspaceRequest(String name, String description, String settings) {
        this.name = name;
        this.description = description;
        this.settings = settings;
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

    public String getSettings() {
        return settings;
    }

    public void setSettings(String settings) {
        this.settings = settings;
    }
}
