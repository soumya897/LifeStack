package com.lifestack.analytics.dto;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Aggregated dashboard summary response as specified in Section 6 (Screen 1).
 * Serves dashboard data in a single performant payload without downloading raw tables.
 */
public class DashboardSummaryResponse {

    private UUID workspaceId;
    private String workspaceName;

    // Metrics
    private long activeRoadmapsCount;
    private long completedRoadmapsCount;
    private long tasksDueTodayCount;
    private long overdueTasksCount;
    private long completedTasksCount;
    private long applicationsSubmittedThisMonthCount;
    private long upcomingInterviewsCount;
    private long followUpsDueCount;

    // Summaries
    private List<RoadmapSummaryItem> recentRoadmaps = Collections.emptyList();
    private List<TaskSummaryItem> priorityTasks = Collections.emptyList();
    private List<ApplicationSummaryItem> recentApplications = Collections.emptyList();
    private List<ActivityItem> recentActivity = Collections.emptyList();

    public DashboardSummaryResponse() {
    }

    public static class RoadmapSummaryItem {
        private UUID id;
        private String name;
        private String status;
        private int progressPercentage;
        private String targetDate;

        public RoadmapSummaryItem() {}

        public RoadmapSummaryItem(UUID id, String name, String status, int progressPercentage, String targetDate) {
            this.id = id;
            this.name = name;
            this.status = status;
            this.progressPercentage = progressPercentage;
            this.targetDate = targetDate;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public int getProgressPercentage() { return progressPercentage; }
        public void setProgressPercentage(int progressPercentage) { this.progressPercentage = progressPercentage; }
        public String getTargetDate() { return targetDate; }
        public void setTargetDate(String targetDate) { this.targetDate = targetDate; }
    }

    public static class TaskSummaryItem {
        private UUID id;
        private String title;
        private String status;
        private Instant dueAt;
        private boolean overdue;

        public TaskSummaryItem() {}

        public TaskSummaryItem(UUID id, String title, String status, Instant dueAt, boolean overdue) {
            this.id = id;
            this.title = title;
            this.status = status;
            this.dueAt = dueAt;
            this.overdue = overdue;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Instant getDueAt() { return dueAt; }
        public void setDueAt(Instant dueAt) { this.dueAt = dueAt; }
        public boolean isOverdue() { return overdue; }
        public void setOverdue(boolean overdue) { this.overdue = overdue; }
    }

    public static class ApplicationSummaryItem {
        private UUID id;
        private String companyName;
        private String jobTitle;
        private String status;
        private String appliedAt;

        public ApplicationSummaryItem() {}

        public ApplicationSummaryItem(UUID id, String companyName, String jobTitle, String status, String appliedAt) {
            this.id = id;
            this.companyName = companyName;
            this.jobTitle = jobTitle;
            this.status = status;
            this.appliedAt = appliedAt;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }
        public String getJobTitle() { return jobTitle; }
        public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getAppliedAt() { return appliedAt; }
        public void setAppliedAt(String appliedAt) { this.appliedAt = appliedAt; }
    }

    public static class ActivityItem {
        private String id;
        private String type;
        private String title;
        private String description;
        private Instant timestamp;

        public ActivityItem() {}

        public ActivityItem(String id, String type, String title, String description, Instant timestamp) {
            this.id = id;
            this.type = type;
            this.title = title;
            this.description = description;
            this.timestamp = timestamp;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Instant getTimestamp() { return timestamp; }
        public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    }

    public UUID getWorkspaceId() { return workspaceId; }
    public void setWorkspaceId(UUID workspaceId) { this.workspaceId = workspaceId; }
    public String getWorkspaceName() { return workspaceName; }
    public void setWorkspaceName(String workspaceName) { this.workspaceName = workspaceName; }
    public long getActiveRoadmapsCount() { return activeRoadmapsCount; }
    public void setActiveRoadmapsCount(long activeRoadmapsCount) { this.activeRoadmapsCount = activeRoadmapsCount; }
    public long getCompletedRoadmapsCount() { return completedRoadmapsCount; }
    public void setCompletedRoadmapsCount(long completedRoadmapsCount) { this.completedRoadmapsCount = completedRoadmapsCount; }
    public long getTasksDueTodayCount() { return tasksDueTodayCount; }
    public void setTasksDueTodayCount(long tasksDueTodayCount) { this.tasksDueTodayCount = tasksDueTodayCount; }
    public long getOverdueTasksCount() { return overdueTasksCount; }
    public void setOverdueTasksCount(long overdueTasksCount) { this.overdueTasksCount = overdueTasksCount; }
    public long getCompletedTasksCount() { return completedTasksCount; }
    public void setCompletedTasksCount(long completedTasksCount) { this.completedTasksCount = completedTasksCount; }
    public long getApplicationsSubmittedThisMonthCount() { return applicationsSubmittedThisMonthCount; }
    public void setApplicationsSubmittedThisMonthCount(long applicationsSubmittedThisMonthCount) { this.applicationsSubmittedThisMonthCount = applicationsSubmittedThisMonthCount; }
    public long getUpcomingInterviewsCount() { return upcomingInterviewsCount; }
    public void setUpcomingInterviewsCount(long upcomingInterviewsCount) { this.upcomingInterviewsCount = upcomingInterviewsCount; }
    public long getFollowUpsDueCount() { return followUpsDueCount; }
    public void setFollowUpsDueCount(long followUpsDueCount) { this.followUpsDueCount = followUpsDueCount; }
    public List<RoadmapSummaryItem> getRecentRoadmaps() { return recentRoadmaps; }
    public void setRecentRoadmaps(List<RoadmapSummaryItem> recentRoadmaps) { this.recentRoadmaps = recentRoadmaps; }
    public List<TaskSummaryItem> getPriorityTasks() { return priorityTasks; }
    public void setPriorityTasks(List<TaskSummaryItem> priorityTasks) { this.priorityTasks = priorityTasks; }
    public List<ApplicationSummaryItem> getRecentApplications() { return recentApplications; }
    public void setRecentApplications(List<ApplicationSummaryItem> recentApplications) { this.recentApplications = recentApplications; }
    public List<ActivityItem> getRecentActivity() { return recentActivity; }
    public void setRecentActivity(List<ActivityItem> recentActivity) { this.recentActivity = recentActivity; }
}
