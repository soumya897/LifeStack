package com.lifestack.common.controller;

import com.lifestack.common.response.ApiResponse;
import com.lifestack.common.response.HealthResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

/**
 * Foundation Health Controller verifying service and database readiness.
 */
@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    private final DataSource dataSource;
    private final Environment environment;

    @Value("${spring.application.name:lifestack-backend}")
    private String applicationName;

    public HealthController(DataSource dataSource, Environment environment) {
        this.dataSource = dataSource;
        this.environment = environment;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<HealthResponse>> checkHealth() {
        Map<String, Object> checks = new HashMap<>();
        boolean dbHealthy = false;

        try (Connection connection = dataSource.getConnection()) {
            dbHealthy = connection.isValid(2);
            checks.put("database", Map.of(
                    "status", dbHealthy ? "UP" : "DOWN",
                    "product", connection.getMetaData().getDatabaseProductName(),
                    "version", connection.getMetaData().getDatabaseProductVersion()
            ));
        } catch (Exception ex) {
            checks.put("database", Map.of(
                    "status", "DOWN",
                    "error", ex.getMessage()
            ));
        }

        String activeProfile = environment.getActiveProfiles().length > 0
                ? String.join(",", environment.getActiveProfiles())
                : "default";

        String overallStatus = dbHealthy ? "UP" : "DEGRADED";
        HealthResponse health = new HealthResponse(
                overallStatus,
                "1.0.0",
                activeProfile,
                checks
        );

        return ResponseEntity.ok(ApiResponse.success("System health verification", health));
    }
}

