package com.lifestack.common.response;

import java.time.Instant;
import java.util.Map;

/**
 * Health response DTO reporting system status, version, and database connectivity.
 */
public class HealthResponse {

    private String status;
    private String version;
    private String environment;
    private Instant timestamp;
    private Map<String, Object> checks;

    public HealthResponse() {
        this.timestamp = Instant.now();
    }

    public HealthResponse(String status, String version, String environment, Map<String, Object> checks) {
        this.status = status;
        this.version = version;
        this.environment = environment;
        this.checks = checks;
        this.timestamp = Instant.now();
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public Map<String, Object> getChecks() {
        return checks;
    }

    public void setChecks(Map<String, Object> checks) {
        this.checks = checks;
    }
}

