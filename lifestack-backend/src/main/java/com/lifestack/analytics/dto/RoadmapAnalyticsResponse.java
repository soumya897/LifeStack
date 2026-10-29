package com.lifestack.analytics.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class RoadmapAnalyticsResponse {

    private int totalRoadmaps;
    private int activeRoadmaps;
    private int completedRoadmaps;
    private int totalTopics;
    private int completedTopics;
    private double overallTopicCompletionPercentage;
    private int totalProblems;
    private int solvedProblems;
    private int totalNotes;
    private Map<String, Integer> problemsByDifficulty = new HashMap<>();
    private Map<String, Integer> problemsByStatus = new HashMap<>();
    private List<RoadmapProgressItem> roadmaps = new ArrayList<>();

    public RoadmapAnalyticsResponse() {
    }

    public static class RoadmapProgressItem {
        private UUID id;
        private String name;
        private String status;
        private double progress;
        private int totalTopics;
        private int completedTopics;
        private LocalDate targetDate;
        private boolean overdue;

        public RoadmapProgressItem() {
        }

        public RoadmapProgressItem(UUID id, String name, String status, double progress,
                                   int totalTopics, int completedTopics, LocalDate targetDate, boolean overdue) {
            this.id = id;
            this.name = name;
            this.status = status;
            this.progress = progress;
            this.totalTopics = totalTopics;
            this.completedTopics = completedTopics;
            this.targetDate = targetDate;
            this.overdue = overdue;
        }

        public UUID getId() {
            return id;
        }

        public void setId(UUID id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public double getProgress() {
            return progress;
        }

        public void setProgress(double progress) {
            this.progress = progress;
        }

        public int getTotalTopics() {
            return totalTopics;
        }

        public void setTotalTopics(int totalTopics) {
            this.totalTopics = totalTopics;
        }

        public int getCompletedTopics() {
            return completedTopics;
        }

        public void setCompletedTopics(int completedTopics) {
            this.completedTopics = completedTopics;
        }

        public LocalDate getTargetDate() {
            return targetDate;
        }

        public void setTargetDate(LocalDate targetDate) {
            this.targetDate = targetDate;
        }

        public boolean isOverdue() {
            return overdue;
        }

        public void setOverdue(boolean overdue) {
            this.overdue = overdue;
        }
    }

    public int getTotalRoadmaps() {
        return totalRoadmaps;
    }

    public void setTotalRoadmaps(int totalRoadmaps) {
        this.totalRoadmaps = totalRoadmaps;
    }

    public int getActiveRoadmaps() {
        return activeRoadmaps;
    }

    public void setActiveRoadmaps(int activeRoadmaps) {
        this.activeRoadmaps = activeRoadmaps;
    }

    public int getCompletedRoadmaps() {
        return completedRoadmaps;
    }

    public void setCompletedRoadmaps(int completedRoadmaps) {
        this.completedRoadmaps = completedRoadmaps;
    }

    public int getTotalTopics() {
        return totalTopics;
    }

    public void setTotalTopics(int totalTopics) {
        this.totalTopics = totalTopics;
    }

    public int getCompletedTopics() {
        return completedTopics;
    }

    public void setCompletedTopics(int completedTopics) {
        this.completedTopics = completedTopics;
    }

    public double getOverallTopicCompletionPercentage() {
        return overallTopicCompletionPercentage;
    }

    public void setOverallTopicCompletionPercentage(double overallTopicCompletionPercentage) {
        this.overallTopicCompletionPercentage = overallTopicCompletionPercentage;
    }

    public int getTotalProblems() {
        return totalProblems;
    }

    public void setTotalProblems(int totalProblems) {
        this.totalProblems = totalProblems;
    }

    public int getSolvedProblems() {
        return solvedProblems;
    }

    public void setSolvedProblems(int solvedProblems) {
        this.solvedProblems = solvedProblems;
    }

    public int getTotalNotes() {
        return totalNotes;
    }

    public void setTotalNotes(int totalNotes) {
        this.totalNotes = totalNotes;
    }

    public Map<String, Integer> getProblemsByDifficulty() {
        return problemsByDifficulty;
    }

    public void setProblemsByDifficulty(Map<String, Integer> problemsByDifficulty) {
        this.problemsByDifficulty = problemsByDifficulty;
    }

    public Map<String, Integer> getProblemsByStatus() {
        return problemsByStatus;
    }

    public void setProblemsByStatus(Map<String, Integer> problemsByStatus) {
        this.problemsByStatus = problemsByStatus;
    }

    public List<RoadmapProgressItem> getRoadmaps() {
        return roadmaps;
    }

    public void setRoadmaps(List<RoadmapProgressItem> roadmaps) {
        this.roadmaps = roadmaps;
    }
}

