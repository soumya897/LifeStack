package com.lifestack.learning.service;

import com.lifestack.common.exception.ResourceNotFoundException;
import com.lifestack.learning.dto.CreateTopicRequest;
import com.lifestack.learning.dto.TopicResponse;
import com.lifestack.learning.dto.UpdateTopicRequest;
import com.lifestack.learning.entity.Roadmap;
import com.lifestack.learning.entity.Topic;
import com.lifestack.learning.entity.TopicStatus;
import com.lifestack.learning.repository.RoadmapRepository;
import com.lifestack.learning.repository.TopicRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class TopicService {

    private final TopicRepository topicRepository;
    private final RoadmapRepository roadmapRepository;
    private final RoadmapService roadmapService;

    public TopicService(TopicRepository topicRepository,
                        RoadmapRepository roadmapRepository,
                        RoadmapService roadmapService) {
        this.topicRepository = topicRepository;
        this.roadmapRepository = roadmapRepository;
        this.roadmapService = roadmapService;
    }

    @Transactional(readOnly = true)
    public List<TopicResponse> listTopics(UUID userId, UUID roadmapId) {
        roadmapRepository.findByIdAndWorkspaceOwnerId(roadmapId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap not found: " + roadmapId));

        return topicRepository.findByRoadmapIdOrderBySortOrderAsc(roadmapId).stream()
                .map(roadmapService::mapTopicToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TopicResponse getTopicById(UUID userId, UUID topicId) {
        Topic topic = topicRepository.findByIdAndRoadmapWorkspaceOwnerId(topicId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + topicId));

        return roadmapService.mapTopicToResponse(topic);
    }

    @Transactional
    public TopicResponse createTopic(UUID userId, UUID roadmapId, CreateTopicRequest request) {
        Roadmap roadmap = roadmapRepository.findByIdAndWorkspaceOwnerId(roadmapId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap not found: " + roadmapId));

        int maxSort = topicRepository.findMaxSortOrderByRoadmapId(roadmapId);
        int nextSort = maxSort + 1;

        Topic topic = new Topic(
                roadmap,
                request.getTitle().trim(),
                request.getDescription() != null ? request.getDescription().trim() : null,
                nextSort,
                request.getWeight() != null ? request.getWeight() : 1,
                request.getStartDate(),
                request.getTargetDate()
        );

        Topic saved = topicRepository.save(topic);
        return roadmapService.mapTopicToResponse(saved);
    }

    @Transactional
    public TopicResponse updateTopic(UUID userId, UUID topicId, UpdateTopicRequest request) {
        Topic topic = topicRepository.findByIdAndRoadmapWorkspaceOwnerId(topicId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + topicId));

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            topic.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            topic.setDescription(request.getDescription().trim());
        }
        if (request.getWeight() != null && request.getWeight() >= 1) {
            topic.setWeight(request.getWeight());
        }
        if (request.getStartDate() != null) {
            topic.setStartDate(request.getStartDate());
        }
        if (request.getTargetDate() != null) {
            topic.setTargetDate(request.getTargetDate());
        }
        if (request.getSortOrder() != null) {
            topic.setSortOrder(request.getSortOrder());
        }
        if (request.getStatus() != null) {
            applyStatusChange(topic, request.getStatus());
        }

        Topic updated = topicRepository.save(topic);
        return roadmapService.mapTopicToResponse(updated);
    }

    @Transactional
    public TopicResponse updateTopicStatus(UUID userId, UUID topicId, TopicStatus newStatus) {
        Topic topic = topicRepository.findByIdAndRoadmapWorkspaceOwnerId(topicId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + topicId));

        applyStatusChange(topic, newStatus);
        Topic updated = topicRepository.save(topic);
        return roadmapService.mapTopicToResponse(updated);
    }

    @Transactional
    public List<TopicResponse> reorderTopics(UUID userId, UUID roadmapId, List<UUID> topicIds) {
        roadmapRepository.findByIdAndWorkspaceOwnerId(roadmapId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap not found: " + roadmapId));

        List<Topic> currentTopics = topicRepository.findByRoadmapIdOrderBySortOrderAsc(roadmapId);
        Map<UUID, Topic> topicMap = currentTopics.stream()
                .collect(Collectors.toMap(Topic::getId, Function.identity()));

        for (int i = 0; i < topicIds.size(); i++) {
            UUID id = topicIds.get(i);
            Topic topic = topicMap.get(id);
            if (topic != null) {
                topic.setSortOrder(i);
            }
        }

        topicRepository.saveAll(currentTopics);

        return topicRepository.findByRoadmapIdOrderBySortOrderAsc(roadmapId).stream()
                .map(roadmapService::mapTopicToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteTopic(UUID userId, UUID topicId) {
        Topic topic = topicRepository.findByIdAndRoadmapWorkspaceOwnerId(topicId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + topicId));

        topicRepository.delete(topic);
    }

    private void applyStatusChange(Topic topic, TopicStatus newStatus) {
        if (newStatus == TopicStatus.COMPLETED && topic.getStatus() != TopicStatus.COMPLETED) {
            topic.setCompletedAt(Instant.now());
        } else if (newStatus != TopicStatus.COMPLETED && topic.getStatus() == TopicStatus.COMPLETED) {
            topic.setCompletedAt(null);
        }
        topic.setStatus(newStatus);
    }
}

