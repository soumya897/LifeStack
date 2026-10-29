package com.lifestack.admin.dto;

import java.util.List;

public class DauMetricsResponse {

    private long todayDau;
    private double sevenDayAverageDau;
    private double thirtyDayAverageDau;
    private List<DailyDauPoint> history;

    public DauMetricsResponse() {
    }

    public DauMetricsResponse(long todayDau, double sevenDayAverageDau, double thirtyDayAverageDau, List<DailyDauPoint> history) {
        this.todayDau = todayDau;
        this.sevenDayAverageDau = sevenDayAverageDau;
        this.thirtyDayAverageDau = thirtyDayAverageDau;
        this.history = history;
    }

    public long getTodayDau() {
        return todayDau;
    }

    public void setTodayDau(long todayDau) {
        this.todayDau = todayDau;
    }

    public double getSevenDayAverageDau() {
        return sevenDayAverageDau;
    }

    public void setSevenDayAverageDau(double sevenDayAverageDau) {
        this.sevenDayAverageDau = sevenDayAverageDau;
    }

    public double getThirtyDayAverageDau() {
        return thirtyDayAverageDau;
    }

    public void setThirtyDayAverageDau(double thirtyDayAverageDau) {
        this.thirtyDayAverageDau = thirtyDayAverageDau;
    }

    public List<DailyDauPoint> getHistory() {
        return history;
    }

    public void setHistory(List<DailyDauPoint> history) {
        this.history = history;
    }
}

