package com.lifestack.analytics.controller;

import com.lifestack.analytics.dto.DashboardSummaryResponse;
import com.lifestack.analytics.dto.InterviewAnalyticsResponse;
import com.lifestack.analytics.dto.JobMonthlyVelocityResponse;
import com.lifestack.analytics.dto.JobSourceAnalyticsResponse;
import com.lifestack.analytics.dto.JobSummaryAnalyticsResponse;
import com.lifestack.analytics.dto.RoadmapAnalyticsResponse;
import com.lifestack.analytics.service.AnalyticsService;
import com.lifestack.analytics.service.DashboardService;
import com.lifestack.common.response.ApiResponse;
import com.lifestack.security.SecurityUser;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * REST controller serving analytical summaries, learning velocity, and career pipeline metrics.
 */
@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final DashboardService dashboardService;
    private final AnalyticsService analyticsService;

    public AnalyticsController(DashboardService dashboardService, AnalyticsService analyticsService) {
        this.dashboardService = dashboardService;
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getDashboardSummary(
            @AuthenticationPrincipal SecurityUser securityUser,
            @RequestParam(required = false) UUID workspaceId) {
        DashboardSummaryResponse summary = dashboardService.getDashboardSummary(securityUser.getId(), workspaceId);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/roadmaps")
    public ResponseEntity<ApiResponse<RoadmapAnalyticsResponse>> getRoadmapAnalytics(
            @AuthenticationPrincipal SecurityUser securityUser,
            @RequestParam(required = false) UUID workspaceId) {
        RoadmapAnalyticsResponse analytics = analyticsService.getRoadmapAnalytics(securityUser.getId(), workspaceId);
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    @GetMapping("/jobs/summary")
    public ResponseEntity<ApiResponse<JobSummaryAnalyticsResponse>> getJobSummary(
            @AuthenticationPrincipal SecurityUser securityUser,
            @RequestParam(required = false) UUID workspaceId) {
        JobSummaryAnalyticsResponse summary = analyticsService.getJobSummary(securityUser.getId(), workspaceId);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/jobs/monthly")
    public ResponseEntity<ApiResponse<JobMonthlyVelocityResponse>> getMonthlyVelocity(
            @AuthenticationPrincipal SecurityUser securityUser,
            @RequestParam(required = false) UUID workspaceId) {
        JobMonthlyVelocityResponse velocity = analyticsService.getMonthlyVelocity(securityUser.getId(), workspaceId);
        return ResponseEntity.ok(ApiResponse.success(velocity));
    }

    @GetMapping("/jobs/by-source")
    public ResponseEntity<ApiResponse<JobSourceAnalyticsResponse>> getSourceAnalytics(
            @AuthenticationPrincipal SecurityUser securityUser,
            @RequestParam(required = false) UUID workspaceId) {
        JobSourceAnalyticsResponse sources = analyticsService.getSourceAnalytics(securityUser.getId(), workspaceId);
        return ResponseEntity.ok(ApiResponse.success(sources));
    }

    @GetMapping("/jobs/interviews")
    public ResponseEntity<ApiResponse<InterviewAnalyticsResponse>> getInterviewAnalytics(
            @AuthenticationPrincipal SecurityUser securityUser,
            @RequestParam(required = false) UUID workspaceId) {
        InterviewAnalyticsResponse interviews = analyticsService.getInterviewAnalytics(securityUser.getId(), workspaceId);
        return ResponseEntity.ok(ApiResponse.success(interviews));
    }
}
