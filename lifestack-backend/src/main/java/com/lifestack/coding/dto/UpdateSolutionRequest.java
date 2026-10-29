package com.lifestack.coding.dto;

import jakarta.validation.constraints.Size;

public class UpdateSolutionRequest {

    @Size(max = 50, message = "Language must not exceed 50 characters")
    private String language;

    private String code;

    private String approach;

    @Size(max = 50, message = "Time complexity must not exceed 50 characters")
    private String timeComplexity;

    @Size(max = 50, message = "Space complexity must not exceed 50 characters")
    private String spaceComplexity;

    public UpdateSolutionRequest() {
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getApproach() {
        return approach;
    }

    public void setApproach(String approach) {
        this.approach = approach;
    }

    public String getTimeComplexity() {
        return timeComplexity;
    }

    public void setTimeComplexity(String timeComplexity) {
        this.timeComplexity = timeComplexity;
    }

    public String getSpaceComplexity() {
        return spaceComplexity;
    }

    public void setSpaceComplexity(String spaceComplexity) {
        this.spaceComplexity = spaceComplexity;
    }
}
