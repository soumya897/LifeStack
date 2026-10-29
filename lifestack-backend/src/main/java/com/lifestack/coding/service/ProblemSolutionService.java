package com.lifestack.coding.service;

import com.lifestack.coding.dto.CreateSolutionRequest;
import com.lifestack.coding.dto.ProblemSolutionResponse;
import com.lifestack.coding.dto.UpdateSolutionRequest;
import com.lifestack.coding.entity.Problem;
import com.lifestack.coding.entity.ProblemSolution;
import com.lifestack.coding.entity.ProblemStatus;
import com.lifestack.coding.repository.ProblemRepository;
import com.lifestack.coding.repository.ProblemSolutionRepository;
import com.lifestack.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProblemSolutionService {

    private final ProblemSolutionRepository solutionRepository;
    private final ProblemRepository problemRepository;
    private final ProblemService problemService;

    public ProblemSolutionService(ProblemSolutionRepository solutionRepository,
                                  ProblemRepository problemRepository,
                                  ProblemService problemService) {
        this.solutionRepository = solutionRepository;
        this.problemRepository = problemRepository;
        this.problemService = problemService;
    }

    @Transactional(readOnly = true)
    public List<ProblemSolutionResponse> listSolutions(UUID userId, UUID problemId) {
        problemRepository.findByIdAndOwnerId(problemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found: " + problemId));

        return solutionRepository.findByProblemIdOrderByCreatedAtDesc(problemId).stream()
                .map(problemService::mapSolutionToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProblemSolutionResponse createSolution(UUID userId, UUID problemId, CreateSolutionRequest request) {
        Problem problem = problemRepository.findByIdAndOwnerId(problemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found: " + problemId));

        ProblemSolution solution = new ProblemSolution(
                problem,
                request.getLanguage().trim(),
                request.getCode(),
                request.getApproach() != null ? request.getApproach().trim() : null,
                request.getTimeComplexity() != null ? request.getTimeComplexity().trim() : null,
                request.getSpaceComplexity() != null ? request.getSpaceComplexity().trim() : null
        );

        // Auto-advance problem status to SOLVED if currently UNSOLVED or ATTEMPTED
        if (problem.getStatus() == ProblemStatus.UNSOLVED || problem.getStatus() == ProblemStatus.ATTEMPTED) {
            problem.setStatus(ProblemStatus.SOLVED);
            problemRepository.save(problem);
        }

        ProblemSolution saved = solutionRepository.save(solution);
        return problemService.mapSolutionToResponse(saved);
    }

    @Transactional
    public ProblemSolutionResponse updateSolution(UUID userId, UUID solutionId, UpdateSolutionRequest request) {
        ProblemSolution solution = solutionRepository.findByIdAndOwnerId(solutionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Solution not found: " + solutionId));

        if (request.getLanguage() != null && !request.getLanguage().isBlank()) {
            solution.setLanguage(request.getLanguage().trim());
        }
        if (request.getCode() != null && !request.getCode().isBlank()) {
            solution.setCode(request.getCode());
        }
        if (request.getApproach() != null) {
            solution.setApproach(request.getApproach().trim());
        }
        if (request.getTimeComplexity() != null) {
            solution.setTimeComplexity(request.getTimeComplexity().trim());
        }
        if (request.getSpaceComplexity() != null) {
            solution.setSpaceComplexity(request.getSpaceComplexity().trim());
        }

        ProblemSolution updated = solutionRepository.save(solution);
        return problemService.mapSolutionToResponse(updated);
    }

    @Transactional
    public void deleteSolution(UUID userId, UUID solutionId) {
        ProblemSolution solution = solutionRepository.findByIdAndOwnerId(solutionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Solution not found: " + solutionId));

        solutionRepository.delete(solution);
    }
}
