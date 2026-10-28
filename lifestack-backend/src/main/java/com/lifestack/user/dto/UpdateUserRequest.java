package com.lifestack.user.dto;

import jakarta.validation.constraints.Size;

public class UpdateUserRequest {

    @Size(max = 100, message = "Display name cannot exceed 100 characters")
    private String displayName;

    @Size(max = 50, message = "Timezone cannot exceed 50 characters")
    private String timezone;

    public UpdateUserRequest() {
    }

    public UpdateUserRequest(String displayName, String timezone) {
        this.displayName = displayName;
        this.timezone = timezone;
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
}
