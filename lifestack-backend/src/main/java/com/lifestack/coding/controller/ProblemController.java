package com.lifestack.coding.controller;

import com.lifestack.coding.dto.CreateProblemRequest;
import com.lifestack.coding.dto.ProblemResponse;
import com.lifestack.coding.dto.UpdateProblemRequest;
import com.lifestack.coding.entity.ProblemDifficulty;
import com.lifestack.coding.entity.ProblemStatus;
import com.lifestack.coding.service.ProblemService;
import com.lifestack.common.response.ApiResponse;
import com.lifestack.security.SecurityUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class ProblemController {

    private final ProblemService problemService;

    public ProblemController(ProblemService problemService) {
        this.problemService = problemService;
    }

    @GetMapping("/api/v1/topics/{topicId}/problems")
    public ResponseEntity<ApiResponse<List<ProblemResponse>>> getProblemsByTopic(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID topicId) {
        List<ProblemResponse> problems = problemService.listProblemsByTopic(securityUser.getId(), topicId);
        return ResponseEntity.ok(ApiResponse.success(problems));
    }

    @GetMapping("/api/v1/problems")
    public ResponseEntity<ApiResponse<List<ProblemResponse>>> getProblemsByWorkspace(
            @AuthenticationPrincipal SecurityUser securityUser,
            @RequestParam UUID workspaceId,
            @RequestParam(required = false) ProblemStatus status,
            @RequestParam(required = false) ProblemDifficulty difficulty) {
        List<ProblemResponse> problems = problemService.listProblemsByWorkspace(
                securityUser.getId(), workspaceId, status, difficulty);
        return ResponseEntity.ok(ApiResponse.success(problems));
    }

    @GetMapping("/api/v1/problems/{id}")
    public ResponseEntity<ApiResponse<ProblemResponse>> getProblem(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID id) {
        ProblemResponse problem = problemService.getProblemById(securityUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(problem));
    }

    @PostMapping("/api/v1/topics/{topicId}/problems")
    public ResponseEntity<ApiResponse<ProblemResponse>> createProblem(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID topicId,
            @Valid @RequestBody CreateProblemRequest request) {
        ProblemResponse created = problemService.createProblem(securityUser.getId(), topicId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Problem created successfully", created));
    }

    @PatchMapping("/api/v1/problems/{id}")
    public ResponseEntity<ApiResponse<ProblemResponse>> updateProblem(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProblemRequest request) {
        ProblemResponse updated = problemService.updateProblem(securityUser.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Problem updated successfully", updated));
    }

    @DeleteMapping("/api/v1/problems/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProblem(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID id) {
        problemService.deleteProblem(securityUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Problem deleted successfully", null));
    }
}
