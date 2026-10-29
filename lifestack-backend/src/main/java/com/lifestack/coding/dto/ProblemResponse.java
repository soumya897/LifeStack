package com.lifestack.coding.dto;

import com.lifestack.coding.entity.ProblemDifficulty;
import com.lifestack.coding.entity.ProblemStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class ProblemResponse {

    private UUID id;
    private UUID topicId;
    private String topicTitle;
    private UUID roadmapId;
    private String roadmapName;
    private String title;
    private String statement;
    private ProblemDifficulty difficulty;
    private String platformUrl;
    private ProblemStatus status;
    private int solutionsCount;
    private List<ProblemSolutionResponse> solutions;
    private Instant createdAt;
    private Instant updatedAt;

    public ProblemResponse() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getTopicId() {
        return topicId;
    }

    public void setTopicId(UUID topicId) {
        this.topicId = topicId;
    }

    public String getTopicTitle() {
        return topicTitle;
    }

    public void setTopicTitle(String topicTitle) {
        this.topicTitle = topicTitle;
    }

    public UUID getRoadmapId() {
        return roadmapId;
    }

    public void setRoadmapId(UUID roadmapId) {
        this.roadmapId = roadmapId;
    }

    public String getRoadmapName() {
        return roadmapName;
    }

    public void setRoadmapName(String roadmapName) {
        this.roadmapName = roadmapName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getStatement() {
        return statement;
    }

    public void setStatement(String statement) {
        this.statement = statement;
    }

    public ProblemDifficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(ProblemDifficulty difficulty) {
        this.difficulty = difficulty;
    }

    public String getPlatformUrl() {
        return platformUrl;
    }

    public void setPlatformUrl(String platformUrl) {
        this.platformUrl = platformUrl;
    }

    public ProblemStatus getStatus() {
        return status;
    }

    public void setStatus(ProblemStatus status) {
        this.status = status;
    }

    public int getSolutionsCount() {
        return solutionsCount;
    }

    public void setSolutionsCount(int solutionsCount) {
        this.solutionsCount = solutionsCount;
    }

    public List<ProblemSolutionResponse> getSolutions() {
        return solutions;
    }

    public void setSolutions(List<ProblemSolutionResponse> solutions) {
        this.solutions = solutions;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
