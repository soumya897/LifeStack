package com.lifestack.user.dto;

import com.lifestack.user.entity.Role;
import com.lifestack.user.entity.User;
import com.lifestack.user.entity.UserStatus;

import java.time.Instant;
import java.util.UUID;

public class UserResponse {

    private UUID id;
    private String email;
    private String displayName;
    private String timezone;
    private Role role;
    private UserStatus status;
    private Instant lastActiveAt;
    private Instant createdAt;

    public UserResponse() {
    }

    public UserResponse(UUID id, String email, String displayName, String timezone,
                        Role role, UserStatus status, Instant lastActiveAt, Instant createdAt) {
        this.id = id;
        this.email = email;
        this.displayName = displayName;
        this.timezone = timezone;
        this.role = role;
        this.status = status;
        this.lastActiveAt = lastActiveAt;
        this.createdAt = createdAt;
    }

    public static UserResponse fromEntity(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getTimezone(),
                user.getRole(),
                user.getStatus(),
                user.getLastActiveAt(),
                user.getCreatedAt()
        );
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
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

    public Instant getLastActiveAt() {
        return lastActiveAt;
    }

    public void setLastActiveAt(Instant lastActiveAt) {
        this.lastActiveAt = lastActiveAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
