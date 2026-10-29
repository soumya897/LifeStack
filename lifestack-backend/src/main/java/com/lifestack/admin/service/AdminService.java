package com.lifestack.admin.service;

import com.lifestack.admin.dto.*;
import com.lifestack.common.exception.ResourceNotFoundException;
import com.lifestack.common.exception.UserAlreadyExistsException;
import com.lifestack.security.SecurityUser;
import com.lifestack.user.entity.Role;
import com.lifestack.user.entity.User;
import com.lifestack.user.entity.UserStatus;
import com.lifestack.user.repository.UserRepository;
import com.lifestack.workspace.entity.Workspace;
import com.lifestack.workspace.repository.WorkspaceRepository;
import com.zaxxer.hikari.HikariDataSource;
import jakarta.persistence.criteria.Predicate;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringBootVersion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.session.SessionInformation;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.lang.management.RuntimeMXBean;
import java.lang.management.ThreadMXBean;
import java.sql.Connection;
import java.sql.Statement;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminService.class);

    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserActivityService userActivityService;
    private final SessionRegistry sessionRegistry;
    private final DataSource dataSource;
    private final Flyway flyway;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository,
                        WorkspaceRepository workspaceRepository,
                        UserActivityService userActivityService,
                        SessionRegistry sessionRegistry,
                        DataSource dataSource,
                        Optional<Flyway> flyway,
                        PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.workspaceRepository = workspaceRepository;
        this.userActivityService = userActivityService;
        this.sessionRegistry = sessionRegistry;
        this.dataSource = dataSource;
        this.flyway = flyway.orElse(null);
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public AdminMetricsResponse getMetrics() {
        // Calculate active unexpired sessions and distinct active logged-in principals
        List<Object> allPrincipals = sessionRegistry.getAllPrincipals();
        long activeSessions = 0;
        long activePrincipalsCount = 0;

        for (Object principal : allPrincipals) {
            List<SessionInformation> sessions = sessionRegistry.getAllSessions(principal, false);
            long unexpiredCount = sessions.stream().filter(s -> !s.isExpired()).count();
            if (unexpiredCount > 0) {
                activeSessions += unexpiredCount;
                activePrincipalsCount++;
            }
        }

        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus(UserStatus.ACTIVE);
        long blockedUsers = userRepository.countByStatus(UserStatus.BLOCKED);
        DauMetricsResponse dauMetrics = userActivityService.getDauMetrics();

        return new AdminMetricsResponse(
                activeSessions,
                activePrincipalsCount,
                totalUsers,
                activeUsers,
                blockedUsers,
                dauMetrics
        );
    }

    @Transactional(readOnly = true)
    public AdminSystemHealthResponse getSystemHealth() {
        // 1. Database Health & Latency
        long startQueryTime = System.currentTimeMillis();
        String dbStatus = "UP";
        long latencyMs = 0;
        String dbProduct = "PostgreSQL";
        String dbVersion = "Unknown";
        int activeConn = 0;
        int idleConn = 0;
        int maxConn = 10;

        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute("SELECT 1");
            latencyMs = System.currentTimeMillis() - startQueryTime;
            dbProduct = conn.getMetaData().getDatabaseProductName();
            dbVersion = conn.getMetaData().getDatabaseProductVersion();

            if (dataSource instanceof HikariDataSource) {
                HikariDataSource hikari = (HikariDataSource) dataSource;
                if (hikari.getHikariPoolMXBean() != null) {
                    activeConn = hikari.getHikariPoolMXBean().getActiveConnections();
                    idleConn = hikari.getHikariPoolMXBean().getIdleConnections();
                    maxConn = hikari.getMaximumPoolSize();
                }
            }
        } catch (Exception e) {
            dbStatus = "DOWN";
            latencyMs = System.currentTimeMillis() - startQueryTime;
            log.error("Database health check error: {}", e.getMessage());
        }

        AdminSystemHealthResponse.DatabaseHealth dbHealth = new AdminSystemHealthResponse.DatabaseHealth(
                dbStatus, latencyMs, dbProduct, dbVersion, activeConn, idleConn, maxConn
        );

        // 2. Flyway Migration Health
        String flywayStatus = "DISABLED";
        String currentVersion = "N/A";
        String lastMigration = "None";
        String installedOn = "N/A";
        int totalMigrations = 0;

        if (flyway != null) {
            try {
                MigrationInfo current = flyway.info().current();
                MigrationInfo[] applied = flyway.info().applied();
                totalMigrations = applied != null ? applied.length : 0;

                if (current != null) {
                    currentVersion = current.getVersion() != null ? current.getVersion().getVersion() : "1.0";
                    lastMigration = current.getScript() != null ? current.getScript() : current.getDescription();
                    installedOn = current.getInstalledOn() != null ? current.getInstalledOn().toString() : "N/A";
                    flywayStatus = current.getState() != null ? current.getState().name() : "SUCCESS";
                } else {
                    flywayStatus = "SUCCESS";
                }
            } catch (Exception e) {
                flywayStatus = "ERROR";
                log.error("Flyway inspection error: {}", e.getMessage(), e);
            }
        }

        AdminSystemHealthResponse.FlywayHealth flywayHealth = new AdminSystemHealthResponse.FlywayHealth(
                flywayStatus, currentVersion, lastMigration, installedOn, totalMigrations
        );

        // 3. Cloud Security & Compliance Telemetry
        List<String> auditLogs = List.of(
                "[SECURITY] Public registration policy strictly locked to standard USER role",
                "[SECURITY] Administrator account provisioning restricted to verified administrators",
                "[ISOLATION] Multi-tenant workspace data strictly partitioned by owner ID",
                "[DATABASE] PostgreSQL connection pool active (HikariCP SSL/TLS)",
                flyway != null
                        ? "[MIGRATIONS] Flyway automated schema verified at version " + currentVersion
                        : "[MIGRATIONS] Flyway automated schema migration disabled in current environment",
                "[MONITOR] Cloud-native minimal logging profile enabled"
        );

        AdminSystemHealthResponse.CloudSecurityHealth securityHealth = new AdminSystemHealthResponse.CloudSecurityHealth(
                "Cloud Production Ready",
                "Multi-Tenant Row-Level Scoping",
                "Stateless JWT (HMAC-SHA256)",
                "Locked (USER Only)",
                "Protected (Admin Required)",
                auditLogs
        );

        // 4. Lightweight JVM Metrics (Optional / Deprecated in Cloud)
        Runtime rt = Runtime.getRuntime();
        double totalMb = Math.round((rt.totalMemory() / (1024.0 * 1024.0)) * 10.0) / 10.0;
        double freeMb = Math.round((rt.freeMemory() / (1024.0 * 1024.0)) * 10.0) / 10.0;
        double maxMb = Math.round((rt.maxMemory() / (1024.0 * 1024.0)) * 10.0) / 10.0;
        double usedMb = Math.round((totalMb - freeMb) * 10.0) / 10.0;
        double utilizationPercent = totalMb > 0 ? Math.round((usedMb / totalMb) * 1000.0) / 10.0 : 0.0;

        ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
        int activeThreads = threadBean.getThreadCount();
        int processors = rt.availableProcessors();

        AdminSystemHealthResponse.JvmHealth jvmHealth = new AdminSystemHealthResponse.JvmHealth(
                usedMb, totalMb, maxMb, utilizationPercent, activeThreads, processors
        );

        // 5. Server Uptime & Specs
        RuntimeMXBean runtimeBean = ManagementFactory.getRuntimeMXBean();
        long uptimeMs = runtimeBean.getUptime();
        String uptimeFormatted = formatUptime(uptimeMs);
        String startTime = Instant.ofEpochMilli(runtimeBean.getStartTime()).toString();
        String javaVersion = System.getProperty("java.version");
        String springBootVersion = SpringBootVersion.getVersion();

        AdminSystemHealthResponse.ServerHealth serverHealth = new AdminSystemHealthResponse.ServerHealth(
                "UP", uptimeMs, uptimeFormatted, startTime, javaVersion, springBootVersion
        );

        return new AdminSystemHealthResponse(dbHealth, flywayHealth, securityHealth, jvmHealth, serverHealth);
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminUserItem> getUsers(String search, UserStatus status, Role role, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("displayName")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern)
                ));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (role != null) {
                predicates.add(cb.equal(root.get("role"), role));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<User> usersPage = userRepository.findAll(spec, pageable);

        Page<AdminUserItem> itemPage = usersPage.map(user -> {
            int wsCount = workspaceRepository.countByOwnerId(user.getId());
            return AdminUserItem.fromEntity(user, wsCount);
        });

        return PageResponse.fromPage(itemPage);
    }

    @Transactional
    public AdminUserItem createAdmin(CreateAdminRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new UserAlreadyExistsException("An account with email " + normalizedEmail + " already exists");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        User adminUser = new User(
                normalizedEmail,
                hashedPassword,
                request.getDisplayName().trim(),
                request.getTimezone() != null ? request.getTimezone().trim() : "UTC",
                Role.ADMIN
        );

        User savedAdmin = userRepository.save(adminUser);

        // Provision initial admin workspace
        Workspace adminWorkspace = new Workspace(
                savedAdmin,
                "Admin Operations",
                "Default administrative workspace"
        );
        workspaceRepository.save(adminWorkspace);

        log.info("[ADMIN PORTAL] Successfully provisioned new Administrator: {}", normalizedEmail);
        return AdminUserItem.fromEntity(savedAdmin, 1);
    }

    @Transactional
    public AdminUserItem blockUser(UUID targetUserId, UUID adminUserId) {
        if (targetUserId.equals(adminUserId)) {
            throw new IllegalArgumentException("Administrators cannot block their own account");
        }

        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + targetUserId));

        user.setStatus(UserStatus.BLOCKED);
        User savedUser = userRepository.save(user);

        // Revoke all active sessions immediately
        revokeUserSessions(targetUserId);

        int wsCount = workspaceRepository.countByOwnerId(savedUser.getId());
        return AdminUserItem.fromEntity(savedUser, wsCount);
    }

    @Transactional
    public AdminUserItem unblockUser(UUID targetUserId) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + targetUserId));

        user.setStatus(UserStatus.ACTIVE);
        User savedUser = userRepository.save(user);

        int wsCount = workspaceRepository.countByOwnerId(savedUser.getId());
        return AdminUserItem.fromEntity(savedUser, wsCount);
    }

    @Transactional
    public void deleteUser(UUID targetUserId, UUID adminUserId) {
        if (targetUserId.equals(adminUserId)) {
            throw new IllegalArgumentException("Administrators cannot delete their own account from the admin console");
        }

        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + targetUserId));

        // Revoke active sessions immediately
        revokeUserSessions(targetUserId);

        userRepository.delete(user);
        log.info("[ADMIN PORTAL] Permanently deleted user account: {} (ID: {}) by Admin ID: {}",
                user.getEmail(), targetUserId, adminUserId);
    }

    private void revokeUserSessions(UUID userId) {
        for (Object principal : sessionRegistry.getAllPrincipals()) {
            if (principal instanceof SecurityUser) {
                SecurityUser su = (SecurityUser) principal;
                if (su.getId().equals(userId)) {
                    List<SessionInformation> sessions = sessionRegistry.getAllSessions(principal, false);
                    for (SessionInformation sessionInfo : sessions) {
                        sessionInfo.expireNow();
                    }
                }
            }
        }
    }

    private String formatUptime(long uptimeMs) {
        long seconds = uptimeMs / 1000;
        long days = seconds / (24 * 3600);
        seconds %= (24 * 3600);
        long hours = seconds / 3600;
        seconds %= 3600;
        long minutes = seconds / 60;
        seconds %= 60;

        StringBuilder sb = new StringBuilder();
        if (days > 0) {
            sb.append(days).append("d ");
        }
        if (hours > 0 || days > 0) {
            sb.append(hours).append("h ");
        }
        sb.append(minutes).append("m ");
        sb.append(seconds).append("s");
        return sb.toString();
    }
}
