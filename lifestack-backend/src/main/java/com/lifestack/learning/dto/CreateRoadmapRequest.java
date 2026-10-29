package com.lifestack.learning.dto;

import com.lifestack.learning.entity.ProgressMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public class CreateRoadmapRequest {

    @NotNull(message = "Workspace ID is required")
    private UUID workspaceId;

    @NotBlank(message = "Roadmap name is required")
    @Size(max = 150, message = "Roadmap name must not exceed 150 characters")
    private String name;

    private String description;

    private ProgressMode progressMode = ProgressMode.TOPIC;

    private LocalDate startDate;

    private LocalDate targetDate;

    public CreateRoadmapRequest() {
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

    public ProgressMode getProgressMode() {
        return progressMode;
    }

    public void setProgressMode(ProgressMode progressMode) {
        this.progressMode = progressMode;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }
}

