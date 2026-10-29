package com.lifestack.learning.service;

import com.lifestack.common.exception.ResourceNotFoundException;
import com.lifestack.learning.dto.*;
import com.lifestack.learning.entity.Roadmap;
import com.lifestack.learning.entity.RoadmapStatus;
import com.lifestack.learning.entity.Topic;
import com.lifestack.learning.repository.RoadmapRepository;
import com.lifestack.learning.repository.TopicRepository;
import com.lifestack.workspace.entity.Workspace;
import com.lifestack.workspace.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RoadmapService {

    private final RoadmapRepository roadmapRepository;
    private final TopicRepository topicRepository;
    private final WorkspaceRepository workspaceRepository;
    private final ProgressCalculationService progressCalculationService;

    public RoadmapService(RoadmapRepository roadmapRepository,
                          TopicRepository topicRepository,
                          WorkspaceRepository workspaceRepository,
                          ProgressCalculationService progressCalculationService) {
        this.roadmapRepository = roadmapRepository;
        this.topicRepository = topicRepository;
        this.workspaceRepository = workspaceRepository;
        this.progressCalculationService = progressCalculationService;
    }

    @Transactional(readOnly = true)
    public List<RoadmapResponse> listRoadmaps(UUID userId, UUID workspaceId, RoadmapStatus status) {
        // Enforce tenant isolation by verifying workspace ownership
        workspaceRepository.findByIdAndOwnerId(workspaceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + workspaceId));

        List<Roadmap> roadmaps;
        if (status != null) {
            roadmaps = roadmapRepository.findByWorkspaceIdAndStatusOrderByCreatedAtDesc(workspaceId, status);
        } else {
            roadmaps = roadmapRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);
        }

        return roadmaps.stream()
                .map(r -> mapToResponse(r, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoadmapResponse getRoadmapById(UUID userId, UUID roadmapId) {
        Roadmap roadmap = roadmapRepository.findByIdAndWorkspaceOwnerId(roadmapId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap not found: " + roadmapId));

        return mapToResponse(roadmap, true);
    }

    @Transactional
    public RoadmapResponse createRoadmap(UUID userId, CreateRoadmapRequest request) {
        Workspace workspace = workspaceRepository.findByIdAndOwnerId(request.getWorkspaceId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + request.getWorkspaceId()));

        Roadmap roadmap = new Roadmap(
                workspace,
                request.getName().trim(),
                request.getDescription() != null ? request.getDescription().trim() : null,
                request.getProgressMode(),
                request.getStartDate(),
                request.getTargetDate()
        );

        Roadmap saved = roadmapRepository.save(roadmap);
        return mapToResponse(saved, false);
    }

    @Transactional
    public RoadmapResponse updateRoadmap(UUID userId, UUID roadmapId, UpdateRoadmapRequest request) {
        Roadmap roadmap = roadmapRepository.findByIdAndWorkspaceOwnerId(roadmapId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap not found: " + roadmapId));

        if (request.getName() != null && !request.getName().isBlank()) {
            roadmap.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            roadmap.setDescription(request.getDescription().trim());
        }
        if (request.getProgressMode() != null) {
            roadmap.setProgressMode(request.getProgressMode());
        }
        if (request.getStartDate() != null) {
            roadmap.setStartDate(request.getStartDate());
        }
        if (request.getTargetDate() != null) {
            roadmap.setTargetDate(request.getTargetDate());
        }
        if (request.getStatus() != null) {
            if (request.getStatus() == RoadmapStatus.COMPLETED && roadmap.getStatus() != RoadmapStatus.COMPLETED) {
                roadmap.setCompletedAt(Instant.now());
            } else if (request.getStatus() != RoadmapStatus.COMPLETED && roadmap.getStatus() == RoadmapStatus.COMPLETED) {
                roadmap.setCompletedAt(null);
            }
            roadmap.setStatus(request.getStatus());
        }

        Roadmap updated = roadmapRepository.save(roadmap);
        return mapToResponse(updated, true);
    }

    @Transactional
    public void deleteRoadmap(UUID userId, UUID roadmapId) {
        Roadmap roadmap = roadmapRepository.findByIdAndWorkspaceOwnerId(roadmapId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap not found: " + roadmapId));

        roadmapRepository.delete(roadmap);
    }

    public RoadmapResponse mapToResponse(Roadmap roadmap, boolean includeTopics) {
        List<Topic> topics = topicRepository.findByRoadmapIdOrderBySortOrderAsc(roadmap.getId());

        double progress = progressCalculationService.calculateProgress(roadmap, topics);
        long completedTopicsCount = topics.stream()
                .filter(t -> t.getStatus() == com.lifestack.learning.entity.TopicStatus.COMPLETED)
                .count();

        RoadmapResponse res = new RoadmapResponse();
        res.setId(roadmap.getId());
        res.setWorkspaceId(roadmap.getWorkspace().getId());
        res.setName(roadmap.getName());
        res.setDescription(roadmap.getDescription());
        res.setStatus(roadmap.getStatus());
        res.setProgressMode(roadmap.getProgressMode());
        res.setStartDate(roadmap.getStartDate());
        res.setTargetDate(roadmap.getTargetDate());
        res.setCompletedAt(roadmap.getCompletedAt());
        res.setCreatedAt(roadmap.getCreatedAt());
        res.setUpdatedAt(roadmap.getUpdatedAt());

        res.setProgressPercentage(progress);
        res.setTotalTopics(topics.size());
        res.setCompletedTopics((int) completedTopicsCount);
        res.setDaysRemaining(progressCalculationService.calculateDaysRemaining(roadmap.getTargetDate()));
        res.setOverdue(progressCalculationService.isRoadmapOverdue(roadmap.getTargetDate(), roadmap.getStatus()));
        res.setElapsedDays(progressCalculationService.calculateElapsedDays(roadmap.getCreatedAt()));

        if (includeTopics) {
            res.setTopics(topics.stream().map(this::mapTopicToResponse).collect(Collectors.toList()));
        } else {
            res.setTopics(Collections.emptyList());
        }

        return res;
    }

    public TopicResponse mapTopicToResponse(Topic topic) {
        TopicResponse res = new TopicResponse();
        res.setId(topic.getId());
        res.setRoadmapId(topic.getRoadmap().getId());
        res.setTitle(topic.getTitle());
        res.setDescription(topic.getDescription());
        res.setStatus(topic.getStatus());
        res.setSortOrder(topic.getSortOrder());
        res.setWeight(topic.getWeight());
        res.setStartDate(topic.getStartDate());
        res.setTargetDate(topic.getTargetDate());
        res.setCompletedAt(topic.getCompletedAt());
        res.setCreatedAt(topic.getCreatedAt());
        res.setUpdatedAt(topic.getUpdatedAt());
        res.setDaysRemaining(progressCalculationService.calculateDaysRemaining(topic.getTargetDate()));
        res.setOverdue(progressCalculationService.isTopicOverdue(topic.getTargetDate(), topic.getStatus()));
        return res;
    }
}

