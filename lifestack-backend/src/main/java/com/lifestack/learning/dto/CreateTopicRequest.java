package com.lifestack.learning.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class CreateTopicRequest {

    @NotBlank(message = "Topic title is required")
    @Size(max = 200, message = "Topic title must not exceed 200 characters")
    private String title;

    private String description;

    @Min(value = 1, message = "Weight must be at least 1")
    private Integer weight = 1;

    private LocalDate startDate;

    private LocalDate targetDate;

    public CreateTopicRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getWeight() {
        return weight;
    }

    public void setWeight(Integer weight) {
        this.weight = weight != null && weight >= 1 ? weight : 1;
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
