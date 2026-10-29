package com.lifestack.admin.dto;

import java.util.List;

public class AdminSystemHealthResponse {

    private DatabaseHealth database;
    private FlywayHealth flyway;
    private CloudSecurityHealth security;
    private JvmHealth jvm;
    private ServerHealth server;

    public AdminSystemHealthResponse() {
    }

    public AdminSystemHealthResponse(DatabaseHealth database, FlywayHealth flyway, CloudSecurityHealth security,
                                    JvmHealth jvm, ServerHealth server) {
        this.database = database;
        this.flyway = flyway;
        this.security = security;
        this.jvm = jvm;
        this.server = server;
    }

    public DatabaseHealth getDatabase() {
        return database;
    }

    public void setDatabase(DatabaseHealth database) {
        this.database = database;
    }

    public FlywayHealth getFlyway() {
        return flyway;
    }

    public void setFlyway(FlywayHealth flyway) {
        this.flyway = flyway;
    }

    public CloudSecurityHealth getSecurity() {
        return security;
    }

    public void setSecurity(CloudSecurityHealth security) {
        this.security = security;
    }

    public JvmHealth getJvm() {
        return jvm;
    }

    public void setJvm(JvmHealth jvm) {
        this.jvm = jvm;
    }

    public ServerHealth getServer() {
        return server;
    }

    public void setServer(ServerHealth server) {
        this.server = server;
    }

    public static class DatabaseHealth {
        private String status;
        private long latencyMs;
        private String product;
        private String version;
        private int activeConnections;
        private int idleConnections;
        private int maxConnections;

        public DatabaseHealth() {}

        public DatabaseHealth(String status, long latencyMs, String product, String version,
                              int activeConnections, int idleConnections, int maxConnections) {
            this.status = status;
            this.latencyMs = latencyMs;
            this.product = product;
            this.version = version;
            this.activeConnections = activeConnections;
            this.idleConnections = idleConnections;
            this.maxConnections = maxConnections;
        }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getLatencyMs() { return latencyMs; }
        public void setLatencyMs(long latencyMs) { this.latencyMs = latencyMs; }
        public String getProduct() { return product; }
        public void setProduct(String product) { this.product = product; }
        public String getVersion() { return version; }
        public void setVersion(String version) { this.version = version; }
        public int getActiveConnections() { return activeConnections; }
        public void setActiveConnections(int activeConnections) { this.activeConnections = activeConnections; }
        public int getIdleConnections() { return idleConnections; }
        public void setIdleConnections(int idleConnections) { this.idleConnections = idleConnections; }
        public int getMaxConnections() { return maxConnections; }
        public void setMaxConnections(int maxConnections) { this.maxConnections = maxConnections; }
    }

    public static class FlywayHealth {
        private String status;
        private String currentVersion;
        private String lastMigration;
        private String installedOn;
        private int totalMigrations;

        public FlywayHealth() {}

        public FlywayHealth(String status, String currentVersion, String lastMigration, String installedOn, int totalMigrations) {
            this.status = status;
            this.currentVersion = currentVersion;
            this.lastMigration = lastMigration;
            this.installedOn = installedOn;
            this.totalMigrations = totalMigrations;
        }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getCurrentVersion() { return currentVersion; }
        public void setCurrentVersion(String currentVersion) { this.currentVersion = currentVersion; }
        public String getLastMigration() { return lastMigration; }
        public void setLastMigration(String lastMigration) { this.lastMigration = lastMigration; }
        public String getInstalledOn() { return installedOn; }
        public void setInstalledOn(String installedOn) { this.installedOn = installedOn; }
        public int getTotalMigrations() { return totalMigrations; }
        public void setTotalMigrations(int totalMigrations) { this.totalMigrations = totalMigrations; }
    }

    public static class CloudSecurityHealth {
        private String environment;
        private String isolationMode;
        private String tokenSecurity;
        private String publicSignupPolicy;
        private String adminProvisioningPolicy;
        private List<String> auditLogs;

        public CloudSecurityHealth() {}

        public CloudSecurityHealth(String environment, String isolationMode, String tokenSecurity,
                                   String publicSignupPolicy, String adminProvisioningPolicy, List<String> auditLogs) {
            this.environment = environment;
            this.isolationMode = isolationMode;
            this.tokenSecurity = tokenSecurity;
            this.publicSignupPolicy = publicSignupPolicy;
            this.adminProvisioningPolicy = adminProvisioningPolicy;
            this.auditLogs = auditLogs;
        }

        public String getEnvironment() { return environment; }
        public void setEnvironment(String environment) { this.environment = environment; }
        public String getIsolationMode() { return isolationMode; }
        public void setIsolationMode(String isolationMode) { this.isolationMode = isolationMode; }
        public String getTokenSecurity() { return tokenSecurity; }
        public void setTokenSecurity(String tokenSecurity) { this.tokenSecurity = tokenSecurity; }
        public String getPublicSignupPolicy() { return publicSignupPolicy; }
        public void setPublicSignupPolicy(String publicSignupPolicy) { this.publicSignupPolicy = publicSignupPolicy; }
        public String getAdminProvisioningPolicy() { return adminProvisioningPolicy; }
        public void setAdminProvisioningPolicy(String adminProvisioningPolicy) { this.adminProvisioningPolicy = adminProvisioningPolicy; }
        public List<String> getAuditLogs() { return auditLogs; }
        public void setAuditLogs(List<String> auditLogs) { this.auditLogs = auditLogs; }
    }

    public static class JvmHealth {
        private double usedMemoryMb;
        private double totalMemoryMb;
        private double maxMemoryMb;
        private double memoryUtilizationPercent;
        private int activeThreads;
        private int availableProcessors;

        public JvmHealth() {}

        public JvmHealth(double usedMemoryMb, double totalMemoryMb, double maxMemoryMb,
                         double memoryUtilizationPercent, int activeThreads, int availableProcessors) {
            this.usedMemoryMb = usedMemoryMb;
            this.totalMemoryMb = totalMemoryMb;
            this.maxMemoryMb = maxMemoryMb;
            this.memoryUtilizationPercent = memoryUtilizationPercent;
            this.activeThreads = activeThreads;
            this.availableProcessors = availableProcessors;
        }

        public double getUsedMemoryMb() { return usedMemoryMb; }
        public void setUsedMemoryMb(double usedMemoryMb) { this.usedMemoryMb = usedMemoryMb; }
        public double getTotalMemoryMb() { return totalMemoryMb; }
        public void setTotalMemoryMb(double totalMemoryMb) { this.totalMemoryMb = totalMemoryMb; }
        public double getMaxMemoryMb() { return maxMemoryMb; }
        public void setMaxMemoryMb(double maxMemoryMb) { this.maxMemoryMb = maxMemoryMb; }
        public double getMemoryUtilizationPercent() { return memoryUtilizationPercent; }
        public void setMemoryUtilizationPercent(double memoryUtilizationPercent) { this.memoryUtilizationPercent = memoryUtilizationPercent; }
        public int getActiveThreads() { return activeThreads; }
        public void setActiveThreads(int activeThreads) { this.activeThreads = activeThreads; }
        public int getAvailableProcessors() { return availableProcessors; }
        public void setAvailableProcessors(int availableProcessors) { this.availableProcessors = availableProcessors; }
    }

    public static class ServerHealth {
        private String status;
        private long uptimeMillis;
        private String uptimeFormatted;
        private String startTime;
        private String javaVersion;
        private String springBootVersion;

        public ServerHealth() {}

        public ServerHealth(String status, long uptimeMillis, String uptimeFormatted,
                            String startTime, String javaVersion, String springBootVersion) {
            this.status = status;
            this.uptimeMillis = uptimeMillis;
            this.uptimeFormatted = uptimeFormatted;
            this.startTime = startTime;
            this.javaVersion = javaVersion;
            this.springBootVersion = springBootVersion;
        }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getUptimeMillis() { return uptimeMillis; }
        public void setUptimeMillis(long uptimeMillis) { this.uptimeMillis = uptimeMillis; }
        public String getUptimeFormatted() { return uptimeFormatted; }
        public void setUptimeFormatted(String uptimeFormatted) { this.uptimeFormatted = uptimeFormatted; }
        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }
        public String getJavaVersion() { return javaVersion; }
        public void setJavaVersion(String javaVersion) { this.javaVersion = javaVersion; }
        public String getSpringBootVersion() { return springBootVersion; }
        public void setSpringBootVersion(String springBootVersion) { this.springBootVersion = springBootVersion; }
    }
}
