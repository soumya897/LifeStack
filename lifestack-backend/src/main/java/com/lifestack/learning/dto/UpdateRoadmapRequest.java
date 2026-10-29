package com.lifestack.learning.dto;

import com.lifestack.learning.entity.ProgressMode;
import com.lifestack.learning.entity.RoadmapStatus;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class UpdateRoadmapRequest {

    @Size(max = 150, message = "Roadmap name must not exceed 150 characters")
    private String name;

    private String description;

    private RoadmapStatus status;

    private ProgressMode progressMode;

    private LocalDate startDate;

    private LocalDate targetDate;

    public UpdateRoadmapRequest() {
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

    public RoadmapStatus getStatus() {
        return status;
    }

    public void setStatus(RoadmapStatus status) {
        this.status = status;
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

