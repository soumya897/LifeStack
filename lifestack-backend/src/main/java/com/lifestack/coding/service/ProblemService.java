package com.lifestack.coding.service;

import com.lifestack.coding.dto.*;
import com.lifestack.coding.entity.Problem;
import com.lifestack.coding.entity.ProblemDifficulty;
import com.lifestack.coding.entity.ProblemSolution;
import com.lifestack.coding.entity.ProblemStatus;
import com.lifestack.coding.repository.ProblemRepository;
import com.lifestack.coding.repository.ProblemSolutionRepository;
import com.lifestack.common.exception.ResourceNotFoundException;
import com.lifestack.learning.entity.Topic;
import com.lifestack.learning.repository.TopicRepository;
import com.lifestack.workspace.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final ProblemSolutionRepository solutionRepository;
    private final TopicRepository topicRepository;
    private final WorkspaceRepository workspaceRepository;

    public ProblemService(ProblemRepository problemRepository,
                          ProblemSolutionRepository solutionRepository,
                          TopicRepository topicRepository,
                          WorkspaceRepository workspaceRepository) {
        this.problemRepository = problemRepository;
        this.solutionRepository = solutionRepository;
        this.topicRepository = topicRepository;
        this.workspaceRepository = workspaceRepository;
    }

    @Transactional(readOnly = true)
    public List<ProblemResponse> listProblemsByTopic(UUID userId, UUID topicId) {
        topicRepository.findByIdAndRoadmapWorkspaceOwnerId(topicId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + topicId));

        return problemRepository.findByTopicIdOrderByCreatedAtDesc(topicId).stream()
                .map(p -> mapToResponse(p, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProblemResponse> listProblemsByWorkspace(UUID userId, UUID workspaceId,
                                                         ProblemStatus status, ProblemDifficulty difficulty) {
        workspaceRepository.findByIdAndOwnerId(workspaceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + workspaceId));

        return problemRepository.findByWorkspaceIdAndFilters(workspaceId, status, difficulty).stream()
                .map(p -> mapToResponse(p, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProblemResponse getProblemById(UUID userId, UUID problemId) {
        Problem problem = problemRepository.findByIdAndOwnerId(problemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found: " + problemId));

        return mapToResponse(problem, true);
    }

    @Transactional
    public ProblemResponse createProblem(UUID userId, UUID topicId, CreateProblemRequest request) {
        Topic topic = topicRepository.findByIdAndRoadmapWorkspaceOwnerId(topicId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + topicId));

        Problem problem = new Problem(
                topic,
                request.getTitle().trim(),
                request.getStatement() != null ? request.getStatement().trim() : null,
                request.getDifficulty(),
                request.getPlatformUrl() != null ? request.getPlatformUrl().trim() : null
        );

        Problem saved = problemRepository.save(problem);
        return mapToResponse(saved, false);
    }

    @Transactional
    public ProblemResponse updateProblem(UUID userId, UUID problemId, UpdateProblemRequest request) {
        Problem problem = problemRepository.findByIdAndOwnerId(problemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found: " + problemId));

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            problem.setTitle(request.getTitle().trim());
        }
        if (request.getStatement() != null) {
            problem.setStatement(request.getStatement().trim());
        }
        if (request.getDifficulty() != null) {
            problem.setDifficulty(request.getDifficulty());
        }
        if (request.getPlatformUrl() != null) {
            problem.setPlatformUrl(request.getPlatformUrl().trim());
        }
        if (request.getStatus() != null) {
            problem.setStatus(request.getStatus());
        }

        Problem updated = problemRepository.save(problem);
        return mapToResponse(updated, true);
    }

    @Transactional
    public void deleteProblem(UUID userId, UUID problemId) {
        Problem problem = problemRepository.findByIdAndOwnerId(problemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found: " + problemId));

        problemRepository.delete(problem);
    }

    public ProblemResponse mapToResponse(Problem problem, boolean includeSolutions) {
        ProblemResponse res = new ProblemResponse();
        res.setId(problem.getId());
        res.setTopicId(problem.getTopic().getId());
        res.setTopicTitle(problem.getTopic().getTitle());
        res.setRoadmapId(problem.getTopic().getRoadmap().getId());
        res.setRoadmapName(problem.getTopic().getRoadmap().getName());
        res.setTitle(problem.getTitle());
        res.setStatement(problem.getStatement());
        res.setDifficulty(problem.getDifficulty());
        res.setPlatformUrl(problem.getPlatformUrl());
        res.setStatus(problem.getStatus());
        res.setCreatedAt(problem.getCreatedAt());
        res.setUpdatedAt(problem.getUpdatedAt());

        List<ProblemSolution> solutions = solutionRepository.findByProblemIdOrderByCreatedAtDesc(problem.getId());
        res.setSolutionsCount(solutions.size());

        if (includeSolutions) {
            res.setSolutions(solutions.stream().map(this::mapSolutionToResponse).collect(Collectors.toList()));
        }

        return res;
    }

    public ProblemSolutionResponse mapSolutionToResponse(ProblemSolution solution) {
        ProblemSolutionResponse res = new ProblemSolutionResponse();
        res.setId(solution.getId());
        res.setProblemId(solution.getProblem().getId());
        res.setLanguage(solution.getLanguage());
        res.setCode(solution.getCode());
        res.setApproach(solution.getApproach());
        res.setTimeComplexity(solution.getTimeComplexity());
        res.setSpaceComplexity(solution.getSpaceComplexity());
        res.setCreatedAt(solution.getCreatedAt());
        res.setUpdatedAt(solution.getUpdatedAt());
        return res;
    }
}
