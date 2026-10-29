package com.lifestack.job.controller;

import com.lifestack.common.response.ApiResponse;
import com.lifestack.job.dto.CreateInterviewRequest;
import com.lifestack.job.dto.InterviewResponse;
import com.lifestack.job.dto.UpdateInterviewRequest;
import com.lifestack.job.service.InterviewEventService;
import com.lifestack.security.SecurityUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class InterviewEventController {

    private final InterviewEventService interviewService;

    public InterviewEventController(InterviewEventService interviewService) {
        this.interviewService = interviewService;
    }

    @GetMapping("/applications/{applicationId}/interviews")
    public ResponseEntity<ApiResponse<List<InterviewResponse>>> getInterviews(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable UUID applicationId) {
        List<InterviewResponse> list = interviewService.getInterviewsForApplication(user.getId(), applicationId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/applications/{applicationId}/interviews")
    public ResponseEntity<ApiResponse<InterviewResponse>> createInterview(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable UUID applicationId,
            @Valid @RequestBody CreateInterviewRequest request) {
        InterviewResponse created = interviewService.createInterview(user.getId(), applicationId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created));
    }

    @PatchMapping("/interviews/{id}")
    public ResponseEntity<ApiResponse<InterviewResponse>> updateInterview(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateInterviewRequest request) {
        InterviewResponse updated = interviewService.updateInterview(user.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @DeleteMapping("/interviews/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInterview(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable UUID id) {
        interviewService.deleteInterview(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

