package com.lifestack.user.controller;

import com.lifestack.common.response.ApiResponse;
import com.lifestack.security.SecurityUser;
import com.lifestack.user.dto.UpdateUserRequest;
import com.lifestack.user.dto.UserResponse;
import com.lifestack.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Controller providing current user profile management.
 */
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(@AuthenticationPrincipal SecurityUser securityUser) {
        UserResponse response = userService.getUserById(securityUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateCurrentUser(@AuthenticationPrincipal SecurityUser securityUser,
                                                                       @Valid @RequestBody UpdateUserRequest request) {
        UserResponse response = userService.updateUser(securityUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }
}

