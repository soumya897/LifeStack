package com.lifestack.analytics.dto;

import java.util.ArrayList;
import java.util.List;

public class JobMonthlyVelocityResponse {

    private List<MonthlyVelocityItem> months = new ArrayList<>();

    public JobMonthlyVelocityResponse() {
    }

    public JobMonthlyVelocityResponse(List<MonthlyVelocityItem> months) {
        this.months = months;
    }

    public static class MonthlyVelocityItem {
        private String yearMonth;
        private int applicationsSubmitted;
        private int interviewsHeld;
        private int offersReceived;
        private int rejectionsReceived;

        public MonthlyVelocityItem() {
        }

        public MonthlyVelocityItem(String yearMonth, int applicationsSubmitted, int interviewsHeld,
                                   int offersReceived, int rejectionsReceived) {
            this.yearMonth = yearMonth;
            this.applicationsSubmitted = applicationsSubmitted;
            this.interviewsHeld = interviewsHeld;
            this.offersReceived = offersReceived;
            this.rejectionsReceived = rejectionsReceived;
        }

        public String getYearMonth() {
            return yearMonth;
        }

        public void setYearMonth(String yearMonth) {
            this.yearMonth = yearMonth;
        }

        public int getApplicationsSubmitted() {
            return applicationsSubmitted;
        }

        public void setApplicationsSubmitted(int applicationsSubmitted) {
            this.applicationsSubmitted = applicationsSubmitted;
        }

        public int getInterviewsHeld() {
            return interviewsHeld;
        }

        public void setInterviewsHeld(int interviewsHeld) {
            this.interviewsHeld = interviewsHeld;
        }

        public int getOffersReceived() {
            return offersReceived;
        }

        public void setOffersReceived(int offersReceived) {
            this.offersReceived = offersReceived;
        }

        public int getRejectionsReceived() {
            return rejectionsReceived;
        }

        public void setRejectionsReceived(int rejectionsReceived) {
            this.rejectionsReceived = rejectionsReceived;
        }
    }

    public List<MonthlyVelocityItem> getMonths() {
        return months;
    }

    public void setMonths(List<MonthlyVelocityItem> months) {
        this.months = months;
    }
}

