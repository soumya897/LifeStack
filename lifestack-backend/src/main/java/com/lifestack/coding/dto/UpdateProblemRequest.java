package com.lifestack.coding.dto;

import com.lifestack.coding.entity.ProblemDifficulty;
import com.lifestack.coding.entity.ProblemStatus;
import jakarta.validation.constraints.Size;

public class UpdateProblemRequest {

    @Size(max = 255, message = "Problem title must not exceed 255 characters")
    private String title;

    private String statement;

    private ProblemDifficulty difficulty;

    private String platformUrl;

    private ProblemStatus status;

    public UpdateProblemRequest() {
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
}
