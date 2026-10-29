package com.lifestack.analytics.service;

import com.lifestack.analytics.dto.DashboardSummaryResponse;
import com.lifestack.common.exception.ResourceNotFoundException;
import com.lifestack.learning.entity.Roadmap;
import com.lifestack.learning.entity.RoadmapStatus;
import com.lifestack.learning.repository.RoadmapRepository;
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
    private final RoadmapRepository roadmapRepository;

    public DashboardService(WorkspaceRepository workspaceRepository,
            RoadmapRepository roadmapRepository) {
        this.workspaceRepository = workspaceRepository;
        this.roadmapRepository = roadmapRepository;
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

        // Real counts for Learning roadmaps in active workspace
        long activeRoadmaps = roadmapRepository.countByWorkspaceIdAndStatus(activeWorkspace.getId(),
                RoadmapStatus.ACTIVE);
        long completedRoadmaps = roadmapRepository.countByWorkspaceIdAndStatus(activeWorkspace.getId(),
                RoadmapStatus.COMPLETED);

        response.setActiveRoadmapsCount((int) activeRoadmaps);
        response.setCompletedRoadmapsCount((int) completedRoadmaps);

        // Future milestones (Tasks & Applications)
        response.setTasksDueTodayCount(0);
        response.setOverdueTasksCount(0);
        response.setCompletedTasksCount(0);
        response.setApplicationsSubmittedThisMonthCount(0);
        response.setUpcomingInterviewsCount(0);
        response.setFollowUpsDueCount(0);

        // Recent activity aggregation
        List<DashboardSummaryResponse.ActivityItem> activities = new ArrayList<>();

        List<Roadmap> recentRoadmaps = roadmapRepository.findTop5ByWorkspaceIdAndStatusOrderByUpdatedAtDesc(
                activeWorkspace.getId(), RoadmapStatus.ACTIVE);

        for (Roadmap r : recentRoadmaps) {
            activities.add(new DashboardSummaryResponse.ActivityItem(
                    r.getId().toString(),
                    "ROADMAP_ACTIVE",
                    "Roadmap In Progress",
                    "Active learning in '" + r.getName() + "'.",
                    r.getUpdatedAt() != null ? r.getUpdatedAt() : r.getCreatedAt()));
        }

        if (activities.isEmpty()) {
            activities.add(new DashboardSummaryResponse.ActivityItem(
                    UUID.randomUUID().toString(),
                    "WORKSPACE_READY",
                    "Workspace Ready",
                    "Your '" + activeWorkspace.getName()
                            + "' workspace is active and ready for your first learning roadmap.",
                    activeWorkspace.getCreatedAt()));
        }

        response.setRecentActivity(activities);

        return response;
    }
}
