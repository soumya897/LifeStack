package com.lifestack.note.service;

import com.lifestack.common.exception.ResourceNotFoundException;
import com.lifestack.learning.entity.Topic;
import com.lifestack.learning.repository.TopicRepository;
import com.lifestack.note.dto.CreateResourceRequest;
import com.lifestack.note.dto.ResourceResponse;
import com.lifestack.note.entity.Resource;
import com.lifestack.note.repository.ResourceRepository;
import com.lifestack.user.entity.User;
import com.lifestack.user.repository.UserRepository;
import com.lifestack.workspace.entity.Workspace;
import com.lifestack.workspace.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private final TopicRepository topicRepository;

    public ResourceService(ResourceRepository resourceRepository,
                           WorkspaceRepository workspaceRepository,
                           UserRepository userRepository,
                           TopicRepository topicRepository) {
        this.resourceRepository = resourceRepository;
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
        this.topicRepository = topicRepository;
    }

    @Transactional(readOnly = true)
    public List<ResourceResponse> listResources(UUID userId, UUID workspaceId) {
        workspaceRepository.findByIdAndOwnerId(workspaceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + workspaceId));

        return resourceRepository.findByWorkspaceIdAndOwnerId(workspaceId, userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ResourceResponse createResource(UUID userId, CreateResourceRequest request) {
        Workspace workspace = workspaceRepository.findByIdAndOwnerId(request.getWorkspaceId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + request.getWorkspaceId()));

        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Resource resource = new Resource(
                workspace,
                owner,
                request.getName().trim(),
                request.getResourceType(),
                request.getUrl().trim()
        );

        if (request.getTopicId() != null) {
            Topic topic = topicRepository.findByIdAndRoadmapWorkspaceOwnerId(request.getTopicId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + request.getTopicId()));
            resource.getTopics().add(topic);
        }

        Resource saved = resourceRepository.save(resource);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteResource(UUID userId, UUID resourceId) {
        Resource resource = resourceRepository.findByIdAndOwnerId(resourceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + resourceId));

        resourceRepository.delete(resource);
    }

    @Transactional(readOnly = true)
    public List<ResourceResponse> listResourcesByTopic(UUID userId, UUID topicId) {
        topicRepository.findByIdAndRoadmapWorkspaceOwnerId(topicId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + topicId));

        return resourceRepository.findResourcesByTopicId(topicId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void linkResourceToTopic(UUID userId, UUID topicId, UUID resourceId) {
        Topic topic = topicRepository.findByIdAndRoadmapWorkspaceOwnerId(topicId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + topicId));
        Resource resource = resourceRepository.findByIdAndOwnerId(resourceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + resourceId));

        resource.getTopics().add(topic);
        resourceRepository.save(resource);
    }

    @Transactional
    public void unlinkResourceFromTopic(UUID userId, UUID topicId, UUID resourceId) {
        Topic topic = topicRepository.findByIdAndRoadmapWorkspaceOwnerId(topicId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + topicId));
        Resource resource = resourceRepository.findByIdAndOwnerId(resourceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + resourceId));

        resource.getTopics().remove(topic);
        resourceRepository.save(resource);
    }

    public ResourceResponse mapToResponse(Resource resource) {
        ResourceResponse res = new ResourceResponse();
        res.setId(resource.getId());
        res.setWorkspaceId(resource.getWorkspace().getId());
        res.setName(resource.getName());
        res.setResourceType(resource.getResourceType());
        res.setUrl(resource.getUrl());
        res.setCreatedAt(resource.getCreatedAt());
        return res;
    }
}
