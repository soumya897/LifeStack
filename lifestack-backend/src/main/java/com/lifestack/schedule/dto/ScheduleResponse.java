package com.lifestack.schedule.dto;

import com.lifestack.schedule.entity.AlertPriority;
import com.lifestack.schedule.entity.ScheduleItem;
import com.lifestack.schedule.entity.ScheduleItemType;
import com.lifestack.schedule.entity.ScheduleStatus;

import java.time.Instant;
import java.util.UUID;

public class ScheduleResponse {

    private UUID id;
    private UUID workspaceId;
    private UUID ownerId;
    private String title;
    private String description;
    private ScheduleItemType itemType;
    private UUID targetId;
    private String targetName;
    private Instant scheduledAt;
    private AlertPriority priority;
    private ScheduleStatus status;
    private boolean soundEnabled;
    private Instant notifiedAt;
    private boolean overdue;
    private Instant createdAt;
    private Instant updatedAt;

    public ScheduleResponse() {
    }

    public static ScheduleResponse fromEntity(ScheduleItem item) {
        ScheduleResponse res = new ScheduleResponse();
        res.setId(item.getId());
        res.setWorkspaceId(item.getWorkspace().getId());
        res.setOwnerId(item.getOwner().getId());
        res.setTitle(item.getTitle());
        res.setDescription(item.getDescription());
        res.setItemType(item.getItemType());
        res.setTargetId(item.getTargetId());
        res.setTargetName(item.getTargetName());
        res.setScheduledAt(item.getScheduledAt());
        res.setPriority(item.getPriority());
        res.setStatus(item.getStatus());
        res.setSoundEnabled(item.isSoundEnabled());
        res.setNotifiedAt(item.getNotifiedAt());
        res.setOverdue(item.getStatus() == ScheduleStatus.PENDING && item.getScheduledAt().isBefore(Instant.now()));
        res.setCreatedAt(item.getCreatedAt());
        res.setUpdatedAt(item.getUpdatedAt());
        return res;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getWorkspaceId() {
        return workspaceId;
    }

    public void setWorkspaceId(UUID workspaceId) {
        this.workspaceId = workspaceId;
    }

    public UUID getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(UUID ownerId) {
        this.ownerId = ownerId;
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

    public boolean isSoundEnabled() {
        return soundEnabled;
    }

    public void setSoundEnabled(boolean soundEnabled) {
        this.soundEnabled = soundEnabled;
    }

    public Instant getNotifiedAt() {
        return notifiedAt;
    }

    public void setNotifiedAt(Instant notifiedAt) {
        this.notifiedAt = notifiedAt;
    }

    public boolean isOverdue() {
        return overdue;
    }

    public void setOverdue(boolean overdue) {
        this.overdue = overdue;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}

