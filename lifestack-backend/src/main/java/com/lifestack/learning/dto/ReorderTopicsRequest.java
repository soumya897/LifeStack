package com.lifestack.learning.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.UUID;

public class ReorderTopicsRequest {

    @NotEmpty(message = "Topic IDs list cannot be empty")
    private List<UUID> topicIds;

    public ReorderTopicsRequest() {
    }

    public ReorderTopicsRequest(List<UUID> topicIds) {
        this.topicIds = topicIds;
    }

    public List<UUID> getTopicIds() {
        return topicIds;
    }

    public void setTopicIds(List<UUID> topicIds) {
        this.topicIds = topicIds;
    }
}

