package com.lifestack.learning.controller;

import com.lifestack.common.response.ApiResponse;
import com.lifestack.learning.dto.CreateRoadmapRequest;
import com.lifestack.learning.dto.RoadmapResponse;
import com.lifestack.learning.dto.UpdateRoadmapRequest;
import com.lifestack.learning.entity.RoadmapStatus;
import com.lifestack.learning.service.RoadmapService;
import com.lifestack.security.SecurityUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/roadmaps")
public class RoadmapController {

    private final RoadmapService roadmapService;

    public RoadmapController(RoadmapService roadmapService) {
        this.roadmapService = roadmapService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoadmapResponse>>> getRoadmaps(
            @AuthenticationPrincipal SecurityUser securityUser,
            @RequestParam UUID workspaceId,
            @RequestParam(required = false) RoadmapStatus status) {
        List<RoadmapResponse> roadmaps = roadmapService.listRoadmaps(securityUser.getId(), workspaceId, status);
        return ResponseEntity.ok(ApiResponse.success(roadmaps));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoadmapResponse>> getRoadmap(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID id) {
        RoadmapResponse roadmap = roadmapService.getRoadmapById(securityUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(roadmap));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RoadmapResponse>> createRoadmap(
            @AuthenticationPrincipal SecurityUser securityUser,
            @Valid @RequestBody CreateRoadmapRequest request) {
        RoadmapResponse created = roadmapService.createRoadmap(securityUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Roadmap created successfully", created));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<RoadmapResponse>> updateRoadmap(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRoadmapRequest request) {
        RoadmapResponse updated = roadmapService.updateRoadmap(securityUser.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Roadmap updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRoadmap(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID id) {
        roadmapService.deleteRoadmap(securityUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Roadmap deleted successfully", null));
    }
}
