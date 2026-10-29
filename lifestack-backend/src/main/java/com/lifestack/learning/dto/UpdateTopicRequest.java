package com.lifestack.learning.dto;

import com.lifestack.learning.entity.TopicStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class UpdateTopicRequest {

    @Size(max = 200, message = "Topic title must not exceed 200 characters")
    private String title;

    private String description;

    private TopicStatus status;

    @Min(value = 1, message = "Weight must be at least 1")
    private Integer weight;

    private LocalDate startDate;

    private LocalDate targetDate;

    private Integer sortOrder;

    public UpdateTopicRequest() {
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

    public TopicStatus getStatus() {
        return status;
    }

    public void setStatus(TopicStatus status) {
        this.status = status;
    }

    public Integer getWeight() {
        return weight;
    }

    public void setWeight(Integer weight) {
        this.weight = weight;
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

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}

