package com.lifestack.analytics.service;

import com.lifestack.analytics.dto.DashboardSummaryResponse;
import com.lifestack.common.exception.ResourceNotFoundException;
import com.lifestack.job.entity.ApplicationStatus;
import com.lifestack.job.entity.InterviewStatus;
import com.lifestack.job.entity.JobApplication;
import com.lifestack.job.repository.InterviewEventRepository;
import com.lifestack.job.repository.JobApplicationRepository;
import com.lifestack.learning.entity.Roadmap;
import com.lifestack.learning.entity.RoadmapStatus;
import com.lifestack.learning.repository.RoadmapRepository;
import com.lifestack.workspace.entity.Workspace;
import com.lifestack.workspace.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Service aggregating dashboard metrics and activity.
 */
@Service
public class DashboardService {

    private final WorkspaceRepository workspaceRepository;
    private final RoadmapRepository roadmapRepository;
    private final JobApplicationRepository applicationRepository;
    private final InterviewEventRepository interviewEventRepository;

    private static final Set<ApplicationStatus> TERMINAL_JOB_STATUSES = EnumSet.of(
            ApplicationStatus.REJECTED,
            ApplicationStatus.WITHDRAWN,
            ApplicationStatus.HIRED
    );

    public DashboardService(WorkspaceRepository workspaceRepository,
                            RoadmapRepository roadmapRepository,
                            JobApplicationRepository applicationRepository,
                            InterviewEventRepository interviewEventRepository) {
        this.workspaceRepository = workspaceRepository;
        this.roadmapRepository = roadmapRepository;
        this.applicationRepository = applicationRepository;
        this.interviewEventRepository = interviewEventRepository;
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

        // Tasks placeholder (Milestone 8)
        response.setTasksDueTodayCount(0);
        response.setOverdueTasksCount(0);
        response.setCompletedTasksCount(0);

        // Real counts for Milestone 6: Job applications
        YearMonth currentMonth = YearMonth.now();
        long applicationsThisMonth = applicationRepository.countByWorkspaceIdAndAppliedAtBetween(
                activeWorkspace.getId(), currentMonth.atDay(1), currentMonth.atEndOfMonth());
        response.setApplicationsSubmittedThisMonthCount((int) applicationsThisMonth);

        long upcomingInterviews = interviewEventRepository.countByApplicationWorkspaceIdAndScheduledAtGreaterThanEqualAndStatus(
                activeWorkspace.getId(), Instant.now(), InterviewStatus.SCHEDULED);
        response.setUpcomingInterviewsCount((int) upcomingInterviews);

        long followUpsDue = applicationRepository.countByWorkspaceIdAndFollowUpAtLessThanEqualAndStatusNotIn(
                activeWorkspace.getId(), LocalDate.now(), TERMINAL_JOB_STATUSES);
        response.setFollowUpsDueCount((int) followUpsDue);

        // Recent activity aggregation (Roadmaps + Job Applications)
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

        List<JobApplication> recentApplications = applicationRepository.findTop5ByWorkspaceIdOrderByUpdatedAtDesc(activeWorkspace.getId());
        List<DashboardSummaryResponse.ApplicationSummaryItem> appSummaryItems = new ArrayList<>();
        for (JobApplication app : recentApplications) {
            appSummaryItems.add(new DashboardSummaryResponse.ApplicationSummaryItem(
                    app.getId(),
                    app.getCompanyName(),
                    app.getJobTitle(),
                    app.getStatus().name(),
                    app.getAppliedAt() != null ? app.getAppliedAt().toString() : ""
            ));
            activities.add(new DashboardSummaryResponse.ActivityItem(
                    app.getId().toString(),
                    "JOB_APPLICATION",
                    "Application: " + app.getCompanyName(),
                    app.getJobTitle() + " (" + app.getStatus() + ")",
                    app.getUpdatedAt() != null ? app.getUpdatedAt() : app.getCreatedAt()
            ));
        }
        response.setRecentApplications(appSummaryItems);

        // Sort combined activities descending by timestamp
        activities.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));

        if (activities.isEmpty()) {
            activities.add(new DashboardSummaryResponse.ActivityItem(
                    UUID.randomUUID().toString(),
                    "WORKSPACE_READY",
                    "Workspace Ready",
                    "Your '" + activeWorkspace.getName()
                            + "' workspace is active and ready for your first learning roadmap or job application.",
                    activeWorkspace.getCreatedAt()));
        }

        response.setRecentActivity(activities);

        return response;
    }
}
