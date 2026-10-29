package com.lifestack.job.controller;

import com.lifestack.common.response.ApiResponse;
import com.lifestack.job.dto.JobStatsSummaryResponse;
import com.lifestack.job.service.JobApplicationService;
import com.lifestack.security.SecurityUser;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/analytics/jobs")
public class JobAnalyticsController {

    private final JobApplicationService applicationService;

    public JobAnalyticsController(JobApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<JobStatsSummaryResponse>> getJobSummary(
            @AuthenticationPrincipal SecurityUser user,
            @RequestParam(required = false) UUID workspaceId) {
        JobStatsSummaryResponse summary = applicationService.getJobStatsSummary(user.getId(), workspaceId);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}

