package com.lifestack.job.controller;

import com.lifestack.common.response.ApiResponse;
import com.lifestack.job.dto.ApplicationDetailResponse;
import com.lifestack.job.dto.ApplicationResponse;
import com.lifestack.job.dto.CreateApplicationRequest;
import com.lifestack.job.dto.JobStatsSummaryResponse;
import com.lifestack.job.dto.UpdateApplicationRequest;
import com.lifestack.job.entity.ApplicationStatus;
import com.lifestack.job.service.JobApplicationService;
import com.lifestack.security.SecurityUser;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/applications")
public class JobApplicationController {

    private final JobApplicationService applicationService;

    public JobApplicationController(JobApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ApplicationResponse>>> getApplications(
            @AuthenticationPrincipal SecurityUser user,
            @RequestParam(required = false) UUID workspaceId,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "appliedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ApplicationResponse> applications = applicationService.getApplications(
                user.getId(), workspaceId, status, source, search, pageable);

        return ResponseEntity.ok(ApiResponse.success(applications));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ApplicationDetailResponse>> getApplication(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable UUID id) {
        ApplicationDetailResponse response = applicationService.getApplication(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ApplicationResponse>> createApplication(
            @AuthenticationPrincipal SecurityUser user,
            @Valid @RequestBody CreateApplicationRequest request) {
        ApplicationResponse created = applicationService.createApplication(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ApplicationResponse>> updateApplication(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateApplicationRequest request) {
        ApplicationResponse updated = applicationService.updateApplication(user.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteApplication(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable UUID id) {
        applicationService.deleteApplication(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/notes/{noteId}")
    public ResponseEntity<ApiResponse<Void>> attachNote(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable UUID id,
            @PathVariable UUID noteId) {
        applicationService.attachNote(user.getId(), id, noteId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/{id}/notes/{noteId}")
    public ResponseEntity<ApiResponse<Void>> detachNote(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable UUID id,
            @PathVariable UUID noteId) {
        applicationService.detachNote(user.getId(), id, noteId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<JobStatsSummaryResponse>> getJobStats(
            @AuthenticationPrincipal SecurityUser user,
            @RequestParam(required = false) UUID workspaceId) {
        JobStatsSummaryResponse stats = applicationService.getJobStatsSummary(user.getId(), workspaceId);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}

