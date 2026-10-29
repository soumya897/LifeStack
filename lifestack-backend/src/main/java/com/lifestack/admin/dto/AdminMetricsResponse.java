package com.lifestack.admin.dto;

public class AdminMetricsResponse {

    private long activeSessions;
    private long activeUsersCount;
    private long totalUsers;
    private long activeUsers;
    private long blockedUsers;
    private DauMetricsResponse dauMetrics;

    public AdminMetricsResponse() {
    }

    public AdminMetricsResponse(long activeSessions, long activeUsersCount, long totalUsers,
                                long activeUsers, long blockedUsers, DauMetricsResponse dauMetrics) {
        this.activeSessions = activeSessions;
        this.activeUsersCount = activeUsersCount;
        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
        this.blockedUsers = blockedUsers;
        this.dauMetrics = dauMetrics;
    }

    public long getActiveSessions() {
        return activeSessions;
    }

    public void setActiveSessions(long activeSessions) {
        this.activeSessions = activeSessions;
    }

    public long getActiveUsersCount() {
        return activeUsersCount;
    }

    public void setActiveUsersCount(long activeUsersCount) {
        this.activeUsersCount = activeUsersCount;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public long getBlockedUsers() {
        return blockedUsers;
    }

    public void setBlockedUsers(long blockedUsers) {
        this.blockedUsers = blockedUsers;
    }

    public DauMetricsResponse getDauMetrics() {
        return dauMetrics;
    }

    public void setDauMetrics(DauMetricsResponse dauMetrics) {
        this.dauMetrics = dauMetrics;
    }
}

