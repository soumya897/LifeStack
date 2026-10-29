package com.lifestack.schedule.dto;

import com.lifestack.schedule.entity.AlertPriority;
import com.lifestack.schedule.entity.ScheduleItemType;
import com.lifestack.schedule.entity.ScheduleStatus;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public class UpdateScheduleRequest {

    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    private String description;

    private ScheduleItemType itemType;

    private UUID targetId;

    @Size(max = 200, message = "Target name must not exceed 200 characters")
    private String targetName;

    private Instant scheduledAt;

    private AlertPriority priority;

    private ScheduleStatus status;

    private Boolean soundEnabled;

    public UpdateScheduleRequest() {
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

    public ScheduleItemType getItemType() {
        return itemType;
    }

    public void setItemType(ScheduleItemType itemType) {
        this.itemType = itemType;
    }

    public UUID getTargetId() {
        return targetId;
    }

    public void setTargetId(UUID targetId) {
        this.targetId = targetId;
    }

    public String getTargetName() {
        return targetName;
    }

    public void setTargetName(String targetName) {
        this.targetName = targetName;
    }

    public Instant getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(Instant scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public AlertPriority getPriority() {
        return priority;
    }

    public void setPriority(AlertPriority priority) {
        this.priority = priority;
    }

    public ScheduleStatus getStatus() {
        return status;
    }

    public void setStatus(ScheduleStatus status) {
        this.status = status;
    }

    public Boolean getSoundEnabled() {
        return soundEnabled;
    }

    public void setSoundEnabled(Boolean soundEnabled) {
        this.soundEnabled = soundEnabled;
    }
}

