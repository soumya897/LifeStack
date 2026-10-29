package com.lifestack.learning.dto;

import com.lifestack.learning.entity.TopicStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateTopicStatusRequest {

    @NotNull(message = "Topic status is required")
    private TopicStatus status;

    public UpdateTopicStatusRequest() {
    }

    public UpdateTopicStatusRequest(TopicStatus status) {
        this.status = status;
    }

    public TopicStatus getStatus() {
        return status;
    }

    public void setStatus(TopicStatus status) {
        this.status = status;
    }
}
