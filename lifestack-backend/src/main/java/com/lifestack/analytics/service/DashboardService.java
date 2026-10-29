package com.lifestack.analytics.service;

import com.lifestack.analytics.dto.DashboardSummaryResponse;
import com.lifestack.common.exception.ResourceNotFoundException;
import com.lifestack.workspace.entity.Workspace;
import com.lifestack.workspace.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Service aggregating dashboard metrics and activity.
 */
@Service
public class DashboardService {

    private final WorkspaceRepository workspaceRepository;

    public DashboardService(WorkspaceRepository workspaceRepository) {
        this.workspaceRepository = workspaceRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary(UUID userId, UUID requestedWorkspaceId) {
        List<Workspace> userWorkspaces = workspaceRepository.findByOwnerIdOrderByCreatedAtAsc(userId);

        if (userWorkspaces.isEmpty()) {
            throw new ResourceNotFoundException("No workspaces found for user");
        }

        Workspace activeWorkspace;
        if (requestedWorkspaceId != null) {
            activeWorkspace = userWorkspaces.stream()
                    .filter(w -> w.getId().equals(requestedWorkspaceId))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + requestedWorkspaceId));
        } else {
            activeWorkspace = userWorkspaces.get(0);
        }

        DashboardSummaryResponse response = new DashboardSummaryResponse();
        response.setWorkspaceId(activeWorkspace.getId());
        response.setWorkspaceName(activeWorkspace.getName());

        // Base metrics (populated from roadmaps, tasks, and applications as milestones expand)
        response.setActiveRoadmapsCount(0);
        response.setCompletedRoadmapsCount(0);
        response.setTasksDueTodayCount(0);
        response.setOverdueTasksCount(0);
        response.setCompletedTasksCount(0);
        response.setApplicationsSubmittedThisMonthCount(0);
        response.setUpcomingInterviewsCount(0);
        response.setFollowUpsDueCount(0);

        // Initial onboarding activity items
        List<DashboardSummaryResponse.ActivityItem> activities = new ArrayList<>();
        activities.add(new DashboardSummaryResponse.ActivityItem(
                UUID.randomUUID().toString(),
                "WORKSPACE_READY",
                "Workspace Ready",
                "Your '" + activeWorkspace.getName() + "' workspace is active and ready for your first learning roadmap.",
                activeWorkspace.getCreatedAt()
        ));

        response.setRecentActivity(activities);

        return response;
    }
}

