package com.lifestack.admin.config;

import com.lifestack.user.entity.Role;
import com.lifestack.user.entity.User;
import com.lifestack.user.entity.UserStatus;
import com.lifestack.user.repository.UserRepository;
import com.lifestack.workspace.entity.Workspace;
import com.lifestack.workspace.repository.WorkspaceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Seeder for initial administrator account provisioning.
 * Explicitly opt-in via configuration (app.admin.enabled=true).
 * Never logs credentials or hashes, and never creates insecure default accounts.
 */
@Component
public class AdminAccountSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminAccountSeeder.class);
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final int MIN_PASSWORD_LENGTH = 8;

    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean enabled;
    private final String adminEmail;
    private final String adminPassword;
    private final String adminName;

    public AdminAccountSeeder(
            UserRepository userRepository,
            WorkspaceRepository workspaceRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.enabled:false}") boolean enabled,
            @Value("${app.admin.email:}") String adminEmail,
            @Value("${app.admin.password:}") String adminPassword,
            @Value("${app.admin.name:System Administrator}") String adminName) {
        this.userRepository = userRepository;
        this.workspaceRepository = workspaceRepository;
        this.passwordEncoder = passwordEncoder;
        this.enabled = enabled;
        this.adminEmail = adminEmail != null ? adminEmail.trim() : "";
        this.adminPassword = adminPassword != null ? adminPassword : "";
        this.adminName = adminName != null && !adminName.isBlank() ? adminName.trim() : "System Administrator";
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void run(String... args) {
        if (!enabled) {
            log.info("[ADMIN SEEDER] Administrator account provisioning is disabled (app.admin.enabled=false).");
            return;
        }

        // Check for existing administrator accounts
        List<User> existingAdmins = userRepository.findByRole(Role.ADMIN);
        if (!existingAdmins.isEmpty()) {
            boolean hasActiveAdmin = existingAdmins.stream()
                    .anyMatch(admin -> admin.getStatus() == UserStatus.ACTIVE);
            if (hasActiveAdmin) {
                log.info("[ADMIN SEEDER] Active administrator account already exists. Seeder skipped.");
                return;
            } else {
                log.warn("[ADMIN SEEDER] Administrator account exists in database with status BLOCKED. Automatic reactivation refused for security. An existing database administrator must be manually reactivated.");
                return;
            }
        }

        // Check if credentials are provided
        if (adminEmail.isBlank() || adminPassword.isBlank()) {
            log.info("[ADMIN SEEDER] No administrator credentials provided (APP_ADMIN_EMAIL / APP_ADMIN_PASSWORD not set). Skipping initial administrator provisioning.");
            return;
        }

        // Validate email format
        String normalizedEmail = adminEmail.toLowerCase(Locale.ROOT);
        if (!EMAIL_PATTERN.matcher(normalizedEmail).matches()) {
            log.error("[ADMIN SEEDER] Invalid email format configured for administrator provisioning. Account will NOT be created.");
            return;
        }

        // Validate password length
        if (adminPassword.length() < MIN_PASSWORD_LENGTH) {
            log.error("[ADMIN SEEDER] Administrator password does not meet minimum length requirement (minimum 8 characters). Account will NOT be created.");
            return;
        }

        // Check if user with this email already exists with non-admin role
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            log.warn("[ADMIN SEEDER] An account with email '{}' already exists with a non-admin role. Will not overwrite or elevate existing user automatically.", normalizedEmail);
            return;
        }

        provisionAdmin(normalizedEmail, adminPassword, adminName);
    }

    @Transactional(rollbackFor = Exception.class)
    protected void provisionAdmin(String normalizedEmail, String rawPassword, String name) {
        String passwordHash = passwordEncoder.encode(rawPassword);
        User admin = new User(
                normalizedEmail,
                passwordHash,
                name,
                "UTC",
                Role.ADMIN
        );
        admin.setStatus(UserStatus.ACTIVE);
        User savedAdmin = userRepository.save(admin);

        Workspace adminWorkspace = new Workspace(
                savedAdmin,
                "Admin Operations",
                "Default administrative workspace"
        );
        workspaceRepository.save(adminWorkspace);

        log.info("[ADMIN SEEDER] Initial administrator provisioned successfully for email: {}", normalizedEmail);
    }
}
