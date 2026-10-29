package com.lifestack.user.service;

import com.lifestack.common.exception.ResourceNotFoundException;
import com.lifestack.common.exception.UserAlreadyExistsException;
import com.lifestack.user.dto.RegisterRequest;
import com.lifestack.user.dto.UpdateUserRequest;
import com.lifestack.user.dto.UserResponse;
import com.lifestack.user.entity.Role;
import com.lifestack.user.entity.User;
import com.lifestack.user.repository.UserRepository;
import com.lifestack.workspace.entity.Workspace;
import com.lifestack.workspace.repository.WorkspaceRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Service managing user identity, registration, profile updates, and automatic default workspace provisioning.
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       WorkspaceRepository workspaceRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.workspaceRepository = workspaceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User registerUser(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new UserAlreadyExistsException("An account with email " + normalizedEmail + " already exists");
        }

        // Public self-registration ALWAYS creates a standard USER account.
        // Administrative accounts can only be provisioned by existing authenticated administrators.
        Role accountRole = Role.USER;
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        User user = new User(
                normalizedEmail,
                hashedPassword,
                request.getDisplayName().trim(),
                request.getTimezone() != null ? request.getTimezone().trim() : "UTC",
                accountRole
        );

        User savedUser = userRepository.save(user);

        // Provision initial default workspace
        Workspace defaultWorkspace = new Workspace(
                savedUser,
                "Personal Workspace",
                "Default workspace for learning roadmaps, coding practice, and job tracking"
        );
        workspaceRepository.save(defaultWorkspace);

        return savedUser;
    }

    @Transactional(readOnly = true)
    public User getUserEntityById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        return UserResponse.fromEntity(getUserEntityById(id));
    }

    @Transactional
    public UserResponse updateUser(UUID id, UpdateUserRequest request) {
        User user = getUserEntityById(id);

        if (request.getDisplayName() != null && !request.getDisplayName().isBlank()) {
            user.setDisplayName(request.getDisplayName().trim());
        }

        if (request.getTimezone() != null && !request.getTimezone().isBlank()) {
            user.setTimezone(request.getTimezone().trim());
        }

        User updatedUser = userRepository.save(user);
        return UserResponse.fromEntity(updatedUser);
    }

    @Transactional
    public void deleteUser(UUID userId) {
        User user = getUserEntityById(userId);
        userRepository.delete(user);
    }
}
