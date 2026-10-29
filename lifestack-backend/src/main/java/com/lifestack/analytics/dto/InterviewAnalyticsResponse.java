package com.lifestack.analytics.dto;

import java.util.HashMap;
import java.util.Map;

public class InterviewAnalyticsResponse {

    private int totalInterviews;
    private int upcomingInterviews;
    private int completedInterviews;
    private Map<String, Integer> byRoundType = new HashMap<>();
    private Map<String, Integer> byStatus = new HashMap<>();
    private Map<String, Integer> byResult = new HashMap<>();

    public InterviewAnalyticsResponse() {
    }

    public int getTotalInterviews() {
        return totalInterviews;
    }

    public void setTotalInterviews(int totalInterviews) {
        this.totalInterviews = totalInterviews;
    }

    public int getUpcomingInterviews() {
        return upcomingInterviews;
    }

    public void setUpcomingInterviews(int upcomingInterviews) {
        this.upcomingInterviews = upcomingInterviews;
    }

    public int getCompletedInterviews() {
        return completedInterviews;
    }

    public void setCompletedInterviews(int completedInterviews) {
        this.completedInterviews = completedInterviews;
    }

    public Map<String, Integer> getByRoundType() {
        return byRoundType;
    }

    public void setByRoundType(Map<String, Integer> byRoundType) {
        this.byRoundType = byRoundType;
    }

    public Map<String, Integer> getByStatus() {
        return byStatus;
    }

    public void setByStatus(Map<String, Integer> byStatus) {
        this.byStatus = byStatus;
    }

    public Map<String, Integer> getByResult() {
        return byResult;
    }

    public void setByResult(Map<String, Integer> byResult) {
        this.byResult = byResult;
    }
}

