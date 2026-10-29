package com.lifestack.workspace.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifestack.common.exception.ResourceNotFoundException;
import com.lifestack.user.entity.User;
import com.lifestack.user.repository.UserRepository;
import com.lifestack.workspace.dto.CreateWorkspaceRequest;
import com.lifestack.workspace.dto.UpdateWorkspaceRequest;
import com.lifestack.workspace.dto.WorkspaceResponse;
import com.lifestack.workspace.entity.Workspace;
import com.lifestack.workspace.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service managing workspace lifecycle with strict tenant isolation.
 */
@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public WorkspaceService(WorkspaceRepository workspaceRepository,
                            UserRepository userRepository,
                            ObjectMapper objectMapper) {
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<WorkspaceResponse> getWorkspacesForUser(UUID userId) {
        return workspaceRepository.findByOwnerIdOrderByCreatedAtAsc(userId)
                .stream()
                .map(WorkspaceResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkspaceResponse getWorkspaceById(UUID workspaceId, UUID userId) {
        Workspace workspace = workspaceRepository.findByIdAndOwnerId(workspaceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + workspaceId));
        return WorkspaceResponse.fromEntity(workspace);
    }

    @Transactional
    public WorkspaceResponse createWorkspace(UUID userId, CreateWorkspaceRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Workspace workspace = new Workspace(user, request.getName().trim(), request.getDescription());
        Workspace saved = workspaceRepository.save(workspace);
        return WorkspaceResponse.fromEntity(saved);
    }

    @Transactional
    public WorkspaceResponse updateWorkspace(UUID workspaceId, UUID userId, UpdateWorkspaceRequest request) {
        Workspace workspace = workspaceRepository.findByIdAndOwnerId(workspaceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + workspaceId));

        if (request.getName() != null && !request.getName().isBlank()) {
            workspace.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            workspace.setDescription(request.getDescription().trim());
        }
        if (request.getSettings() != null) {
            String trimmedSettings = request.getSettings().trim();
            if (!trimmedSettings.isEmpty()) {
                try {
                    objectMapper.readTree(trimmedSettings);
                } catch (Exception e) {
                    throw new IllegalArgumentException("Invalid JSON syntax for workspace settings");
                }
            }
            workspace.setSettings(trimmedSettings.isEmpty() ? "{}" : trimmedSettings);
        }

        Workspace updated = workspaceRepository.save(workspace);
        return WorkspaceResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteWorkspace(UUID workspaceId, UUID userId) {
        // Strict ownership check first: must belong to this user
        Workspace workspace = workspaceRepository.findByIdAndOwnerId(workspaceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + workspaceId));

        // Then verify user has more than 1 workspace
        List<Workspace> userWorkspaces = workspaceRepository.findByOwnerIdOrderByCreatedAtAsc(userId);
        if (userWorkspaces.size() <= 1) {
            throw new IllegalArgumentException("Cannot delete your only workspace");
        }

        workspaceRepository.delete(workspace);
    }
}
