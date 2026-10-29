package com.lifestack.admin.dto;

public class DailyDauPoint {

    private String date;
    private long activeUsers;

    public DailyDauPoint() {
    }

    public DailyDauPoint(String date, long activeUsers) {
        this.date = date;
        this.activeUsers = activeUsers;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }
}

