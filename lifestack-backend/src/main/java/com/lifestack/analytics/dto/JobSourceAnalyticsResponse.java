package com.lifestack.analytics.dto;

import java.util.ArrayList;
import java.util.List;

public class JobSourceAnalyticsResponse {

    private List<SourcePerformanceItem> sources = new ArrayList<>();

    public JobSourceAnalyticsResponse() {
    }

    public JobSourceAnalyticsResponse(List<SourcePerformanceItem> sources) {
        this.sources = sources;
    }

    public static class SourcePerformanceItem {
        private String source;
        private int totalApplications;
        private int interviewCount;
        private int offerCount;
        private double interviewRate;
        private double offerRate;

        public SourcePerformanceItem() {
        }

        public SourcePerformanceItem(String source, int totalApplications, int interviewCount,
                                     int offerCount, double interviewRate, double offerRate) {
            this.source = source;
            this.totalApplications = totalApplications;
            this.interviewCount = interviewCount;
            this.offerCount = offerCount;
            this.interviewRate = interviewRate;
            this.offerRate = offerRate;
        }

        public String getSource() {
            return source;
        }

        public void setSource(String source) {
            this.source = source;
        }

        public int getTotalApplications() {
            return totalApplications;
        }

        public void setTotalApplications(int totalApplications) {
            this.totalApplications = totalApplications;
        }

        public int getInterviewCount() {
            return interviewCount;
        }

        public void setInterviewCount(int interviewCount) {
            this.interviewCount = interviewCount;
        }

        public int getOfferCount() {
            return offerCount;
        }

        public void setOfferCount(int offerCount) {
            this.offerCount = offerCount;
        }

        public double getInterviewRate() {
            return interviewRate;
        }

        public void setInterviewRate(double interviewRate) {
            this.interviewRate = interviewRate;
        }

        public double getOfferRate() {
            return offerRate;
        }

        public void setOfferRate(double offerRate) {
            this.offerRate = offerRate;
        }
    }

    public List<SourcePerformanceItem> getSources() {
        return sources;
    }

    public void setSources(List<SourcePerformanceItem> sources) {
        this.sources = sources;
    }
}

