package com.lifestack.note.controller;

import com.lifestack.common.response.ApiResponse;
import com.lifestack.note.dto.CreateResourceRequest;
import com.lifestack.note.dto.ResourceResponse;
import com.lifestack.note.service.ResourceService;
import com.lifestack.security.SecurityUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping("/api/v1/resources")
    public ResponseEntity<ApiResponse<List<ResourceResponse>>> getResources(
            @AuthenticationPrincipal SecurityUser securityUser,
            @RequestParam UUID workspaceId) {
        List<ResourceResponse> resources = resourceService.listResources(securityUser.getId(), workspaceId);
        return ResponseEntity.ok(ApiResponse.success(resources));
    }

    @PostMapping("/api/v1/resources")
    public ResponseEntity<ApiResponse<ResourceResponse>> createResource(
            @AuthenticationPrincipal SecurityUser securityUser,
            @Valid @RequestBody CreateResourceRequest request) {
        ResourceResponse created = resourceService.createResource(securityUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resource created successfully", created));
    }

    @DeleteMapping("/api/v1/resources/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteResource(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID id) {
        resourceService.deleteResource(securityUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Resource deleted successfully", null));
    }

    @GetMapping("/api/v1/topics/{topicId}/resources")
    public ResponseEntity<ApiResponse<List<ResourceResponse>>> getResourcesByTopic(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID topicId) {
        List<ResourceResponse> resources = resourceService.listResourcesByTopic(securityUser.getId(), topicId);
        return ResponseEntity.ok(ApiResponse.success(resources));
    }

    @PostMapping("/api/v1/topics/{topicId}/resources/{resourceId}")
    public ResponseEntity<ApiResponse<Void>> linkResourceToTopic(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID topicId,
            @PathVariable UUID resourceId) {
        resourceService.linkResourceToTopic(securityUser.getId(), topicId, resourceId);
        return ResponseEntity.ok(ApiResponse.success("Resource linked to topic", null));
    }

    @DeleteMapping("/api/v1/topics/{topicId}/resources/{resourceId}")
    public ResponseEntity<ApiResponse<Void>> unlinkResourceFromTopic(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID topicId,
            @PathVariable UUID resourceId) {
        resourceService.unlinkResourceFromTopic(securityUser.getId(), topicId, resourceId);
        return ResponseEntity.ok(ApiResponse.success("Resource unlinked from topic", null));
    }
}
