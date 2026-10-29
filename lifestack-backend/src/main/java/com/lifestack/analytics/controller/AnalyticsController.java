package com.lifestack.analytics.controller;

import com.lifestack.analytics.dto.DashboardSummaryResponse;
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
 * REST controller serving analytical summaries and dashboard metrics.
 */
@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final DashboardService dashboardService;

    public AnalyticsController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getDashboardSummary(
            @AuthenticationPrincipal SecurityUser securityUser,
            @RequestParam(required = false) UUID workspaceId) {
        DashboardSummaryResponse summary = dashboardService.getDashboardSummary(securityUser.getId(), workspaceId);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}

