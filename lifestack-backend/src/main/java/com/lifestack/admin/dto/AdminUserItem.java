package com.lifestack.admin.dto;

import com.lifestack.user.entity.Role;
import com.lifestack.user.entity.User;
import com.lifestack.user.entity.UserStatus;

import java.time.Instant;
import java.util.UUID;

public class AdminUserItem {

    private UUID id;
    private String displayName;
    private String email;
    private Role role;
    private UserStatus status;
    private String timezone;
    private Instant createdAt;
    private Instant lastActiveAt;
    private int workspacesCount;

    public AdminUserItem() {
    }

    public AdminUserItem(UUID id, String displayName, String email, Role role, UserStatus status,
                         String timezone, Instant createdAt, Instant lastActiveAt, int workspacesCount) {
        this.id = id;
        this.displayName = displayName;
        this.email = email;
        this.role = role;
        this.status = status;
        this.timezone = timezone;
        this.createdAt = createdAt;
        this.lastActiveAt = lastActiveAt;
        this.workspacesCount = workspacesCount;
    }

    public static AdminUserItem fromEntity(User user, int workspacesCount) {
        return new AdminUserItem(
                user.getId(),
                user.getDisplayName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getTimezone(),
                user.getCreatedAt(),
                user.getLastActiveAt(),
                workspacesCount
        );
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getLastActiveAt() {
        return lastActiveAt;
    }

    public void setLastActiveAt(Instant lastActiveAt) {
        this.lastActiveAt = lastActiveAt;
    }

    public int getWorkspacesCount() {
        return workspacesCount;
    }

    public void setWorkspacesCount(int workspacesCount) {
        this.workspacesCount = workspacesCount;
    }
}

