package com.lifestack.learning.controller;

import com.lifestack.common.response.ApiResponse;
import com.lifestack.learning.dto.*;
import com.lifestack.learning.service.TopicService;
import com.lifestack.security.SecurityUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class TopicController {

    private final TopicService topicService;

    public TopicController(TopicService topicService) {
        this.topicService = topicService;
    }

    @GetMapping("/api/v1/roadmaps/{roadmapId}/topics")
    public ResponseEntity<ApiResponse<List<TopicResponse>>> getTopics(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID roadmapId) {
        List<TopicResponse> topics = topicService.listTopics(securityUser.getId(), roadmapId);
        return ResponseEntity.ok(ApiResponse.success(topics));
    }

    @PostMapping("/api/v1/roadmaps/{roadmapId}/topics")
    public ResponseEntity<ApiResponse<TopicResponse>> createTopic(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID roadmapId,
            @Valid @RequestBody CreateTopicRequest request) {
        TopicResponse created = topicService.createTopic(securityUser.getId(), roadmapId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Topic created successfully", created));
    }

    @PutMapping("/api/v1/roadmaps/{roadmapId}/topics/reorder")
    public ResponseEntity<ApiResponse<List<TopicResponse>>> reorderTopics(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID roadmapId,
            @Valid @RequestBody ReorderTopicsRequest request) {
        List<TopicResponse> reordered = topicService.reorderTopics(securityUser.getId(), roadmapId, request.getTopicIds());
        return ResponseEntity.ok(ApiResponse.success("Topics reordered successfully", reordered));
    }

    @GetMapping("/api/v1/topics/{id}")
    public ResponseEntity<ApiResponse<TopicResponse>> getTopic(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID id) {
        TopicResponse topic = topicService.getTopicById(securityUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(topic));
    }

    @PatchMapping("/api/v1/topics/{id}")
    public ResponseEntity<ApiResponse<TopicResponse>> updateTopic(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTopicRequest request) {
        TopicResponse updated = topicService.updateTopic(securityUser.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Topic updated successfully", updated));
    }

    @PatchMapping("/api/v1/topics/{id}/status")
    public ResponseEntity<ApiResponse<TopicResponse>> updateTopicStatus(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTopicStatusRequest request) {
        TopicResponse updated = topicService.updateTopicStatus(securityUser.getId(), id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Topic status updated successfully", updated));
    }

    @DeleteMapping("/api/v1/topics/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTopic(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID id) {
        topicService.deleteTopic(securityUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Topic deleted successfully", null));
    }
}

