package com.lifestack.admin;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.lifestack.admin.config.AdminAccountSeeder;
import com.lifestack.user.entity.Role;
import com.lifestack.user.entity.User;
import com.lifestack.user.entity.UserStatus;
import com.lifestack.user.repository.UserRepository;
import com.lifestack.workspace.entity.Workspace;
import com.lifestack.workspace.repository.WorkspaceRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminAccountSeederTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private WorkspaceRepository workspaceRepository;

    private PasswordEncoder passwordEncoder;
    private ListAppender<ILoggingEvent> listAppender;
    private Logger logger;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder(12);

        logger = (Logger) LoggerFactory.getLogger(AdminAccountSeeder.class);
        listAppender = new ListAppender<>();
        listAppender.start();
        logger.addAppender(listAppender);
    }

    @AfterEach
    void tearDown() {
        if (logger != null && listAppender != null) {
            logger.detachAppender(listAppender);
            listAppender.stop();
        }
    }

    @Test
    @DisplayName("1. When disabled by configuration, seeder performs zero database interactions")
    void whenDisabledByConfig_thenDoNothing() {
        AdminAccountSeeder seeder = new AdminAccountSeeder(
                userRepository,
                workspaceRepository,
                passwordEncoder,
                false, // enabled = false
                "admin@example.com",
                "SecurePassword123!",
                "System Administrator"
        );

        seeder.run();

        verifyNoInteractions(userRepository);
        verifyNoInteractions(workspaceRepository);
    }

    @Test
    @DisplayName("2. When an active administrator already exists, do not modify or provision")
    void whenActiveAdminAlreadyExists_thenDoNotModifyOrProvision() {
        User existingAdmin = new User("existing-admin@lifestack.dev", "$2a$12$hash", "Existing Admin", "UTC", Role.ADMIN);
        existingAdmin.setStatus(UserStatus.ACTIVE);

        when(userRepository.findByRole(Role.ADMIN)).thenReturn(List.of(existingAdmin));

        AdminAccountSeeder seeder = new AdminAccountSeeder(
                userRepository,
                workspaceRepository,
                passwordEncoder,
                true,
                "admin@example.com",
                "SecurePassword123!",
                "System Administrator"
        );

        seeder.run();

        verify(userRepository, never()).save(any());
        verifyNoInteractions(workspaceRepository);
    }

    @Test
    @DisplayName("3. When an administrator exists but is BLOCKED, do NOT unblock or modify the account")
    void whenAdminExistsButInactive_thenDoNotReactivateOrModify() {
        User blockedAdmin = new User("blocked-admin@lifestack.dev", "$2a$12$hash", "Blocked Admin", "UTC", Role.ADMIN);
        blockedAdmin.setStatus(UserStatus.BLOCKED);

        when(userRepository.findByRole(Role.ADMIN)).thenReturn(List.of(blockedAdmin));

        AdminAccountSeeder seeder = new AdminAccountSeeder(
                userRepository,
                workspaceRepository,
                passwordEncoder,
                true,
                "admin@example.com",
                "SecurePassword123!",
                "System Administrator"
        );

        seeder.run();

        verify(userRepository, never()).save(any());
        verifyNoInteractions(workspaceRepository);
        assertEquals(UserStatus.BLOCKED, blockedAdmin.getStatus(), "Blocked administrator must remain BLOCKED");
    }

    @Test
    @DisplayName("4. When credentials are missing or blank, safely skip without creating default credentials")
    void whenCredentialsMissing_thenSkipSafelyWithoutDefaultCredentials() {
        when(userRepository.findByRole(Role.ADMIN)).thenReturn(Collections.emptyList());

        AdminAccountSeeder seeder = new AdminAccountSeeder(
                userRepository,
                workspaceRepository,
                passwordEncoder,
                true,
                "", // empty email
                "", // empty password
                "System Administrator"
        );

        seeder.run();

        verify(userRepository, never()).save(any());
        verifyNoInteractions(workspaceRepository);
    }

    @Test
    @DisplayName("5. When password is shorter than 8 characters, abort provisioning")
    void whenPasswordTooShort_thenAbortProvisioning() {
        when(userRepository.findByRole(Role.ADMIN)).thenReturn(Collections.emptyList());

        AdminAccountSeeder seeder = new AdminAccountSeeder(
                userRepository,
                workspaceRepository,
                passwordEncoder,
                true,
                "admin@example.com",
                "short", // 5 chars (< 8)
                "System Administrator"
        );

        seeder.run();

        verify(userRepository, never()).save(any());
        verifyNoInteractions(workspaceRepository);
    }

    @Test
    @DisplayName("6. When email format is invalid, abort provisioning")
    void whenInvalidEmailFormat_thenAbortProvisioning() {
        when(userRepository.findByRole(Role.ADMIN)).thenReturn(Collections.emptyList());

        AdminAccountSeeder seeder = new AdminAccountSeeder(
                userRepository,
                workspaceRepository,
                passwordEncoder,
                true,
                "not-an-email",
                "SecurePassword123!",
                "System Administrator"
        );

        seeder.run();

        verify(userRepository, never()).save(any());
        verifyNoInteractions(workspaceRepository);
    }

    @Test
    @DisplayName("7. When valid credentials provided and no admin exists, provision atomically with BCrypt hash")
    void whenValidCredentialsAndNoAdmin_thenProvisionWithBCryptHash() {
        when(userRepository.findByRole(Role.ADMIN)).thenReturn(Collections.emptyList());
        when(userRepository.existsByEmailIgnoreCase("admin@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        String rawPassword = "P@ssword2026Safe!";
        AdminAccountSeeder seeder = new AdminAccountSeeder(
                userRepository,
                workspaceRepository,
                passwordEncoder,
                true,
                "  Admin@Example.COM  ", // test trimming and lowercase normalization
                rawPassword,
                "Lead Admin"
        );

        seeder.run();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertEquals("admin@example.com", savedUser.getEmail(), "Email must be normalized to lowercase and trimmed");
        assertEquals("Lead Admin", savedUser.getDisplayName());
        assertEquals(Role.ADMIN, savedUser.getRole());
        assertEquals(UserStatus.ACTIVE, savedUser.getStatus());

        // Verify password hash
        assertNotNull(savedUser.getPasswordHash());
        assertTrue(savedUser.getPasswordHash().startsWith("$2a$12$"), "Hash must be standard BCrypt 12 rounds");
        assertNotEquals(rawPassword, savedUser.getPasswordHash(), "Plaintext password must never be stored");
        assertTrue(passwordEncoder.matches(rawPassword, savedUser.getPasswordHash()), "BCrypt hash must match raw password");

        // Verify initial workspace creation
        ArgumentCaptor<Workspace> workspaceCaptor = ArgumentCaptor.forClass(Workspace.class);
        verify(workspaceRepository).save(workspaceCaptor.capture());
        Workspace savedWorkspace = workspaceCaptor.getValue();
        assertEquals("Admin Operations", savedWorkspace.getName());
        assertEquals(savedUser, savedWorkspace.getOwner());
    }

    @Test
    @DisplayName("8. Plaintext passwords, hashes, and secrets are NEVER logged")
    void whenLogsCaptured_neverContainsPlaintextPasswordOrHash() {
        when(userRepository.findByRole(Role.ADMIN)).thenReturn(Collections.emptyList());
        when(userRepository.existsByEmailIgnoreCase("admin@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        String sensitivePassword = "SuperSecretPlainTextPass99!";
        AdminAccountSeeder seeder = new AdminAccountSeeder(
                userRepository,
                workspaceRepository,
                passwordEncoder,
                true,
                "admin@example.com",
                sensitivePassword,
                "System Administrator"
        );

        seeder.run();

        List<ILoggingEvent> events = listAppender.list;
        assertFalse(events.isEmpty(), "Expected seeder log events to be captured");

        for (ILoggingEvent event : events) {
            String formattedMessage = event.getFormattedMessage();
            assertFalse(formattedMessage.contains(sensitivePassword),
                    "Logs must never contain the plaintext password: " + formattedMessage);
            assertFalse(formattedMessage.contains("$2a$12$"),
                    "Logs must never contain the password hash: " + formattedMessage);
        }
    }

    @Test
    @DisplayName("9. Workspace failure throws exception to trigger transactional rollback")
    void whenWorkspaceCreationFails_thenExceptionIsPropagatedForRollback() {
        when(userRepository.findByRole(Role.ADMIN)).thenReturn(Collections.emptyList());
        when(userRepository.existsByEmailIgnoreCase("admin@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        doThrow(new RuntimeException("Simulated database failure during workspace creation"))
                .when(workspaceRepository).save(any(Workspace.class));

        AdminAccountSeeder seeder = new AdminAccountSeeder(
                userRepository,
                workspaceRepository,
                passwordEncoder,
                true,
                "admin@example.com",
                "SecurePassword123!",
                "System Administrator"
        );

        assertThrows(RuntimeException.class, seeder::run,
                "Exception during workspace creation must be rethrown so @Transactional triggers rollback");
    }
}

