package com.lifestack.schedule.controller;

import com.lifestack.common.response.ApiResponse;
import com.lifestack.schedule.dto.CreateScheduleRequest;
import com.lifestack.schedule.dto.ScheduleResponse;
import com.lifestack.schedule.dto.UpdateScheduleRequest;
import com.lifestack.schedule.entity.ScheduleItemType;
import com.lifestack.schedule.entity.ScheduleStatus;
import com.lifestack.schedule.service.ScheduleService;
import com.lifestack.security.SecurityUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ScheduleResponse>>> getSchedules(
            @AuthenticationPrincipal SecurityUser securityUser,
            @RequestParam UUID workspaceId,
            @RequestParam(required = false) ScheduleStatus status,
            @RequestParam(required = false) ScheduleItemType itemType) {
        List<ScheduleResponse> items = scheduleService.listSchedules(
                securityUser.getId(), workspaceId, status, itemType);
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ScheduleResponse>> getSchedule(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID id) {
        ScheduleResponse item = scheduleService.getScheduleById(securityUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(item));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ScheduleResponse>> createSchedule(
            @AuthenticationPrincipal SecurityUser securityUser,
            @Valid @RequestBody CreateScheduleRequest request) {
        ScheduleResponse created = scheduleService.createSchedule(securityUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Schedule item created successfully", created));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ScheduleResponse>> updateSchedule(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateScheduleRequest request) {
        ScheduleResponse updated = scheduleService.updateSchedule(securityUser.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Schedule item updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ScheduleResponse>> updateStatus(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID id,
            @RequestBody Map<String, String> payload) {
        String statusStr = payload.get("status");
        if (statusStr == null || statusStr.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }
        ScheduleStatus status = ScheduleStatus.valueOf(statusStr.toUpperCase());
        ScheduleResponse updated = scheduleService.updateStatus(securityUser.getId(), id, status);
        return ResponseEntity.ok(ApiResponse.success("Status updated successfully", updated));
    }

    @PatchMapping("/{id}/acknowledge")
    public ResponseEntity<ApiResponse<ScheduleResponse>> acknowledgeNotification(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID id) {
        ScheduleResponse updated = scheduleService.acknowledgeNotification(securityUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Notification acknowledged", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable UUID id) {
        scheduleService.deleteSchedule(securityUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Schedule item deleted successfully", null));
    }
}

