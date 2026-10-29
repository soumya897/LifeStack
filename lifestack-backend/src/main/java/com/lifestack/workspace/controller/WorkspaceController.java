package com.lifestack.workspace.controller;

import com.lifestack.common.response.ApiResponse;
import com.lifestack.security.SecurityUser;
import com.lifestack.workspace.dto.CreateWorkspaceRequest;
import com.lifestack.workspace.dto.UpdateWorkspaceRequest;
import com.lifestack.workspace.dto.WorkspaceResponse;
import com.lifestack.workspace.service.WorkspaceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller for workspace management, enforcing tenant boundary checks on every endpoint.
 */
@RestController
@RequestMapping("/api/v1/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkspaceResponse>>> getWorkspaces(
            @AuthenticationPrincipal SecurityUser securityUser) {
        List<WorkspaceResponse> workspaces = workspaceService.getWorkspacesForUser(securityUser.getId());
        return ResponseEntity.ok(ApiResponse.success(workspaces));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WorkspaceResponse>> createWorkspace(
            @AuthenticationPrincipal SecurityUser securityUser,
            @Valid @RequestBody CreateWorkspaceRequest request) {
        WorkspaceResponse workspace = workspaceService.createWorkspace(securityUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Workspace created successfully", workspace));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkspaceResponse>> getWorkspace(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID id) {
        WorkspaceResponse workspace = workspaceService.getWorkspaceById(id, securityUser.getId());
        return ResponseEntity.ok(ApiResponse.success(workspace));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkspaceResponse>> updateWorkspace(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateWorkspaceRequest request) {
        WorkspaceResponse workspace = workspaceService.updateWorkspace(id, securityUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Workspace updated successfully", workspace));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteWorkspace(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID id) {
        workspaceService.deleteWorkspace(id, securityUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Workspace deleted successfully", null));
    }
}
