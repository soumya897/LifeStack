package com.lifestack.coding.controller;

import com.lifestack.coding.dto.CreateSolutionRequest;
import com.lifestack.coding.dto.ProblemSolutionResponse;
import com.lifestack.coding.dto.UpdateSolutionRequest;
import com.lifestack.coding.service.ProblemSolutionService;
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
public class ProblemSolutionController {

    private final ProblemSolutionService solutionService;

    public ProblemSolutionController(ProblemSolutionService solutionService) {
        this.solutionService = solutionService;
    }

    @GetMapping("/api/v1/problems/{problemId}/solutions")
    public ResponseEntity<ApiResponse<List<ProblemSolutionResponse>>> getSolutions(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID problemId) {
        List<ProblemSolutionResponse> solutions = solutionService.listSolutions(securityUser.getId(), problemId);
        return ResponseEntity.ok(ApiResponse.success(solutions));
    }

    @PostMapping("/api/v1/problems/{problemId}/solutions")
    public ResponseEntity<ApiResponse<ProblemSolutionResponse>> createSolution(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID problemId,
            @Valid @RequestBody CreateSolutionRequest request) {
        ProblemSolutionResponse created = solutionService.createSolution(securityUser.getId(), problemId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Solution saved successfully", created));
    }

    @PatchMapping("/api/v1/solutions/{id}")
    public ResponseEntity<ApiResponse<ProblemSolutionResponse>> updateSolution(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateSolutionRequest request) {
        ProblemSolutionResponse updated = solutionService.updateSolution(securityUser.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Solution updated successfully", updated));
    }

    @DeleteMapping("/api/v1/solutions/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSolution(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID id) {
        solutionService.deleteSolution(securityUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Solution deleted successfully", null));
    }
}
