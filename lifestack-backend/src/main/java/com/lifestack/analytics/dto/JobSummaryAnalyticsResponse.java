package com.lifestack.analytics.dto;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class JobSummaryAnalyticsResponse {

    private int totalApplications;
    private int appliedThisMonth;
    private int activeInterviews;
    private int offersCount;
    private int hiredCount;
    private int rejectionsCount;
    private int followUpsDue;
    private double offerRatePercentage;
    private Map<String, Integer> byStatus = new HashMap<>();
    private Map<String, Integer> bySource = new HashMap<>();
    private List<FunnelStageItem> stageFunnel = new ArrayList<>();

    public JobSummaryAnalyticsResponse() {
    }

    public static class FunnelStageItem {
        private String stage;
        private int count;
        private double conversionRate;

        public FunnelStageItem() {
        }

        public FunnelStageItem(String stage, int count, double conversionRate) {
            this.stage = stage;
            this.count = count;
            this.conversionRate = conversionRate;
        }

        public String getStage() {
            return stage;
        }

        public void setStage(String stage) {
            this.stage = stage;
        }

        public int getCount() {
            return count;
        }

        public void setCount(int count) {
            this.count = count;
        }

        public double getConversionRate() {
            return conversionRate;
        }

        public void setConversionRate(double conversionRate) {
            this.conversionRate = conversionRate;
        }
    }

    public int getTotalApplications() {
        return totalApplications;
    }

    public void setTotalApplications(int totalApplications) {
        this.totalApplications = totalApplications;
    }

    public int getAppliedThisMonth() {
        return appliedThisMonth;
    }

    public void setAppliedThisMonth(int appliedThisMonth) {
        this.appliedThisMonth = appliedThisMonth;
    }

    public int getActiveInterviews() {
        return activeInterviews;
    }

    public void setActiveInterviews(int activeInterviews) {
        this.activeInterviews = activeInterviews;
    }

    public int getOffersCount() {
        return offersCount;
    }

    public void setOffersCount(int offersCount) {
        this.offersCount = offersCount;
    }

    public int getHiredCount() {
        return hiredCount;
    }

    public void setHiredCount(int hiredCount) {
        this.hiredCount = hiredCount;
    }

    public int getRejectionsCount() {
        return rejectionsCount;
    }

    public void setRejectionsCount(int rejectionsCount) {
        this.rejectionsCount = rejectionsCount;
    }

    public int getFollowUpsDue() {
        return followUpsDue;
    }

    public void setFollowUpsDue(int followUpsDue) {
        this.followUpsDue = followUpsDue;
    }

    public double getOfferRatePercentage() {
        return offerRatePercentage;
    }

    public void setOfferRatePercentage(double offerRatePercentage) {
        this.offerRatePercentage = offerRatePercentage;
    }

    public Map<String, Integer> getByStatus() {
        return byStatus;
    }

    public void setByStatus(Map<String, Integer> byStatus) {
        this.byStatus = byStatus;
    }

    public Map<String, Integer> getBySource() {
        return bySource;
    }

    public void setBySource(Map<String, Integer> bySource) {
        this.bySource = bySource;
    }

    public List<FunnelStageItem> getStageFunnel() {
        return stageFunnel;
    }

    public void setStageFunnel(List<FunnelStageItem> stageFunnel) {
        this.stageFunnel = stageFunnel;
    }
}

