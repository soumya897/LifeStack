package com.lifestack.admin.controller;

import com.lifestack.admin.dto.*;
import com.lifestack.admin.service.AdminService;
import com.lifestack.common.response.ApiResponse;
import com.lifestack.security.SecurityUser;
import com.lifestack.user.entity.Role;
import com.lifestack.user.entity.UserStatus;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller exposing administrative capabilities for system monitoring and user moderation.
 */
@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<AdminMetricsResponse>> getMetrics() {
        AdminMetricsResponse metrics = adminService.getMetrics();
        return ResponseEntity.ok(ApiResponse.success("Admin metrics retrieved successfully", metrics));
    }

    @GetMapping("/system-health")
    public ResponseEntity<ApiResponse<AdminSystemHealthResponse>> getSystemHealth() {
        AdminSystemHealthResponse health = adminService.getSystemHealth();
        return ResponseEntity.ok(ApiResponse.success("System health verified successfully", health));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PageResponse<AdminUserItem>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) Role role,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        PageResponse<AdminUserItem> users = adminService.getUsers(search, status, role, pageable);
        return ResponseEntity.ok(ApiResponse.success("User directory retrieved successfully", users));
    }

    @PostMapping("/users/create-admin")
    public ResponseEntity<ApiResponse<AdminUserItem>> createAdmin(@Valid @RequestBody CreateAdminRequest request) {
        AdminUserItem newAdmin = adminService.createAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Administrator account provisioned successfully", newAdmin));
    }

    @PostMapping("/users/{userId}/block")
    public ResponseEntity<ApiResponse<AdminUserItem>> blockUser(
            @PathVariable UUID userId,
            @AuthenticationPrincipal SecurityUser adminUser
    ) {
        AdminUserItem updatedUser = adminService.blockUser(userId, adminUser.getId());
        return ResponseEntity.ok(ApiResponse.success("User blocked and all active sessions revoked successfully", updatedUser));
    }

    @PostMapping("/users/{userId}/unblock")
    public ResponseEntity<ApiResponse<AdminUserItem>> unblockUser(@PathVariable UUID userId) {
        AdminUserItem updatedUser = adminService.unblockUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User unblocked successfully", updatedUser));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable UUID userId,
            @AuthenticationPrincipal SecurityUser adminUser
    ) {
        adminService.deleteUser(userId, adminUser.getId());
        return ResponseEntity.ok(ApiResponse.success("User account permanently deleted successfully", null));
    }
}
