package com.lifestack.schedule.service;

import com.lifestack.common.exception.ResourceNotFoundException;
import com.lifestack.schedule.dto.CreateScheduleRequest;
import com.lifestack.schedule.dto.ScheduleResponse;
import com.lifestack.schedule.dto.UpdateScheduleRequest;
import com.lifestack.schedule.entity.ScheduleItem;
import com.lifestack.schedule.entity.ScheduleItemType;
import com.lifestack.schedule.entity.ScheduleStatus;
import com.lifestack.schedule.repository.ScheduleRepository;
import com.lifestack.user.entity.User;
import com.lifestack.user.repository.UserRepository;
import com.lifestack.workspace.entity.Workspace;
import com.lifestack.workspace.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;

    public ScheduleService(ScheduleRepository scheduleRepository,
                           WorkspaceRepository workspaceRepository,
                           UserRepository userRepository) {
        this.scheduleRepository = scheduleRepository;
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ScheduleResponse> listSchedules(UUID userId, UUID workspaceId,
                                                ScheduleStatus status, ScheduleItemType itemType) {
        workspaceRepository.findByIdAndOwnerId(workspaceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + workspaceId));

        List<ScheduleItem> items;
        if (status != null && itemType != null) {
            items = scheduleRepository.findByWorkspaceIdAndOwnerIdAndStatusAndItemTypeOrderByScheduledAtAsc(
                    workspaceId, userId, status, itemType);
        } else if (status != null) {
            items = scheduleRepository.findByWorkspaceIdAndOwnerIdAndStatusOrderByScheduledAtAsc(
                    workspaceId, userId, status);
        } else if (itemType != null) {
            items = scheduleRepository.findByWorkspaceIdAndOwnerIdAndItemTypeOrderByScheduledAtAsc(
                    workspaceId, userId, itemType);
        } else {
            items = scheduleRepository.findByWorkspaceIdAndOwnerIdOrderByScheduledAtAsc(workspaceId, userId);
        }

        return items.stream()
                .map(ScheduleResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ScheduleResponse getScheduleById(UUID userId, UUID scheduleId) {
        ScheduleItem item = scheduleRepository.findByIdAndOwnerId(scheduleId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule item not found: " + scheduleId));

        return ScheduleResponse.fromEntity(item);
    }

    @Transactional
    public ScheduleResponse createSchedule(UUID userId, CreateScheduleRequest request) {
        Workspace workspace = workspaceRepository.findByIdAndOwnerId(request.getWorkspaceId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found: " + request.getWorkspaceId()));

        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        ScheduleItem item = new ScheduleItem(
                workspace,
                owner,
                request.getTitle().trim(),
                request.getDescription() != null ? request.getDescription().trim() : null,
                request.getItemType(),
                request.getTargetId(),
                request.getTargetName() != null ? request.getTargetName().trim() : null,
                request.getScheduledAt(),
                request.getPriority(),
                request.isSoundEnabled()
        );

        ScheduleItem saved = scheduleRepository.save(item);
        return ScheduleResponse.fromEntity(saved);
    }

    @Transactional
    public ScheduleResponse updateSchedule(UUID userId, UUID scheduleId, UpdateScheduleRequest request) {
        ScheduleItem item = scheduleRepository.findByIdAndOwnerId(scheduleId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule item not found: " + scheduleId));

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            item.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            item.setDescription(request.getDescription().trim());
        }
        if (request.getItemType() != null) {
            item.setItemType(request.getItemType());
        }
        if (request.getTargetId() != null) {
            item.setTargetId(request.getTargetId());
        }
        if (request.getTargetName() != null) {
            item.setTargetName(request.getTargetName().trim());
        }
        if (request.getScheduledAt() != null) {
            item.setScheduledAt(request.getScheduledAt());
        }
        if (request.getPriority() != null) {
            item.setPriority(request.getPriority());
        }
        if (request.getStatus() != null) {
            item.setStatus(request.getStatus());
        }
        if (request.getSoundEnabled() != null) {
            item.setSoundEnabled(request.getSoundEnabled());
        }

        ScheduleItem updated = scheduleRepository.save(item);
        return ScheduleResponse.fromEntity(updated);
    }

    @Transactional
    public ScheduleResponse updateStatus(UUID userId, UUID scheduleId, ScheduleStatus status) {
        ScheduleItem item = scheduleRepository.findByIdAndOwnerId(scheduleId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule item not found: " + scheduleId));

        item.setStatus(status);
        ScheduleItem updated = scheduleRepository.save(item);
        return ScheduleResponse.fromEntity(updated);
    }

    @Transactional
    public ScheduleResponse acknowledgeNotification(UUID userId, UUID scheduleId) {
        ScheduleItem item = scheduleRepository.findByIdAndOwnerId(scheduleId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule item not found: " + scheduleId));

        item.setNotifiedAt(Instant.now());
        ScheduleItem updated = scheduleRepository.save(item);
        return ScheduleResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteSchedule(UUID userId, UUID scheduleId) {
        ScheduleItem item = scheduleRepository.findByIdAndOwnerId(scheduleId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule item not found: " + scheduleId));

        scheduleRepository.delete(item);
    }
}

