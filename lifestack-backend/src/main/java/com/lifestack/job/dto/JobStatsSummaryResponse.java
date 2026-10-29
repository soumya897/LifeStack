package com.lifestack.job.dto;

import java.util.HashMap;
import java.util.Map;

public class JobStatsSummaryResponse {

    private long totalApplications;
    private long appliedThisMonth;
    private long activeInterviews;
    private long offersCount;
    private long rejectionsCount;
    private long followUpsDue;
    private Map<String, Long> byStatus = new HashMap<>();
    private Map<String, Long> bySource = new HashMap<>();

    public JobStatsSummaryResponse() {
    }

    // Getters and Setters
    public long getTotalApplications() {
        return totalApplications;
    }

    public void setTotalApplications(long totalApplications) {
        this.totalApplications = totalApplications;
    }

    public long getAppliedThisMonth() {
        return appliedThisMonth;
    }

    public void setAppliedThisMonth(long appliedThisMonth) {
        this.appliedThisMonth = appliedThisMonth;
    }

    public long getActiveInterviews() {
        return activeInterviews;
    }

    public void setActiveInterviews(long activeInterviews) {
        this.activeInterviews = activeInterviews;
    }

    public long getOffersCount() {
        return offersCount;
    }

    public void setOffersCount(long offersCount) {
        this.offersCount = offersCount;
    }

    public long getRejectionsCount() {
        return rejectionsCount;
    }

    public void setRejectionsCount(long rejectionsCount) {
        this.rejectionsCount = rejectionsCount;
    }

    public long getFollowUpsDue() {
        return followUpsDue;
    }

    public void setFollowUpsDue(long followUpsDue) {
        this.followUpsDue = followUpsDue;
    }

    public Map<String, Long> getByStatus() {
        return byStatus;
    }

    public void setByStatus(Map<String, Long> byStatus) {
        this.byStatus = byStatus;
    }

    public Map<String, Long> getBySource() {
        return bySource;
    }

    public void setBySource(Map<String, Long> bySource) {
        this.bySource = bySource;
    }
}

