package com.lifestack.common.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

/**
 * Flyway configuration for LifeStack.
 * Cleans up stale legacy migration records (e.g. removed template migrations)
 * and repairs schema history before migrating.
 */
@Configuration
public class FlywayConfig {

    private static final Logger log = LoggerFactory.getLogger(FlywayConfig.class);

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            try (Connection conn = flyway.getConfiguration().getDataSource().getConnection();
                 Statement stmt = conn.createStatement()) {

                // Check and log current schema history rows
                try (ResultSet rs = stmt.executeQuery(
                        "SELECT installed_rank, version, description, script, success FROM flyway_schema_history ORDER BY installed_rank")) {
                    while (rs.next()) {
                        log.info("FLYWAY_HISTORY: rank={}, version={}, desc={}, script={}, success={}",
                                rs.getInt("installed_rank"),
                                rs.getString("version"),
                                rs.getString("description"),
                                rs.getString("script"),
                                rs.getBoolean("success"));
                    }
                }

                // If version 5 or higher in flyway_schema_history was for old migrations (e.g. templates)
                // or if schedules table doesn't exist yet, clean history for >= 5 so V5 can run cleanly.
                boolean schedulesTableExists = false;
                try (ResultSet rs = stmt.executeQuery(
                        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'schedules')")) {
                    if (rs.next()) {
                        schedulesTableExists = rs.getBoolean(1);
                    }
                }
                log.info("Schedules table exists in DB: {}", schedulesTableExists);

                if (!schedulesTableExists) {
                    log.warn("Schedules table missing! Purging any stale flyway_schema_history records for version >= '5'");
                    stmt.executeUpdate("DELETE FROM flyway_schema_history WHERE version >= '5'");
                }

            } catch (Exception e) {
                log.warn("Flyway pre-migration history inspection warning: {}", e.getMessage());
            }

            flyway.repair();
            flyway.migrate();
        };
    }
}

