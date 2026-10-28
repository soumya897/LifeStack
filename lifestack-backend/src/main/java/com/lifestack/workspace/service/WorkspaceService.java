package com.lifestack.workspace.service;

import com.lifestack.common.exception.ResourceNotFoundException;
import com.lifestack.user.entity.User;
import com.lifestack.user.repository.UserRepository;
import com.lifestack.workspace.dto.CreateWorkspaceRequest;
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

    public WorkspaceService(WorkspaceRepository workspaceRepository, UserRepository userRepository) {
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
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
    public void deleteWorkspace(UUID workspaceId, UUID userId) {
        Workspace workspace = workspaceRepository.findByIdAndOwnerId(workspaceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + workspaceId));
        workspaceRepository.delete(workspace);
    }
}
