package com.lifestack.admin.config;

import com.lifestack.user.entity.Role;
import com.lifestack.user.entity.User;
import com.lifestack.user.entity.UserStatus;
import com.lifestack.user.repository.UserRepository;
import com.lifestack.workspace.entity.Workspace;
import com.lifestack.workspace.repository.WorkspaceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Seeder ensuring an active administrator account exists upon startup.
 */
@Component
public class AdminAccountSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminAccountSeeder.class);

    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminAccountSeeder(UserRepository userRepository,
                              WorkspaceRepository workspaceRepository,
                              PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.workspaceRepository = workspaceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        String adminEmail = "admin@lifestack.dev";
        Optional<User> existingUserOpt = userRepository.findByEmailIgnoreCase(adminEmail);

        if (existingUserOpt.isPresent()) {
            User existing = existingUserOpt.get();
            if (existing.getRole() != Role.ADMIN || existing.getStatus() != UserStatus.ACTIVE) {
                existing.setRole(Role.ADMIN);
                existing.setStatus(UserStatus.ACTIVE);
                userRepository.save(existing);
                log.info("[ADMIN SEEDER] Upgraded existing account {} to active ADMIN", adminEmail);
            }
        } else if (!userRepository.existsByRole(Role.ADMIN)) {
            User admin = new User(
                    adminEmail,
                    passwordEncoder.encode("Admin@LifeStack123"),
                    "System Administrator",
                    "UTC",
                    Role.ADMIN
            );
            User savedAdmin = userRepository.save(admin);

            // Create initial admin workspace
            Workspace adminWorkspace = new Workspace(
                    savedAdmin,
                    "Admin Operations",
                    "Default administrative workspace"
            );
            workspaceRepository.save(adminWorkspace);

            log.info("=================================================================");
            log.info("[ADMIN SEEDER] Initial Administrator account provisioned:");
            log.info("  Email:    {}", adminEmail);
            log.info("  Password: {}", "Admin@LifeStack123");
            log.info("=================================================================");
        }
    }
}
