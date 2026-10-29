package com.lifestack.schedule;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifestack.schedule.dto.CreateScheduleRequest;
import com.lifestack.schedule.dto.UpdateScheduleRequest;
import com.lifestack.schedule.entity.AlertPriority;
import com.lifestack.schedule.entity.ScheduleItemType;
import com.lifestack.schedule.entity.ScheduleStatus;
import com.lifestack.user.dto.RegisterRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ScheduleIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Schedule & Alert Lifecycle: Create, List with Filters, Reschedule, Complete, Acknowledge, and Tenant Isolation")
    void testScheduleLifecycleAndTenantIsolation() throws Exception {
        // 1. Register User A
        RegisterRequest userReqA = new RegisterRequest(
                "scheduler_alice@lifestack.dev",
                "Password123!",
                "Scheduler Alice",
                "UTC"
        );
        MvcResult regResultA = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userReqA)))
                .andExpect(status().isCreated())
                .andReturn();

        MockHttpSession sessionA = (MockHttpSession) regResultA.getRequest().getSession(false);

        // Fetch User A Workspace
        MvcResult wsResultA = mockMvc.perform(get("/api/v1/workspaces").session(sessionA))
                .andExpect(status().isOk())
                .andReturn();
        UUID workspaceIdA = UUID.fromString(
                objectMapper.readTree(wsResultA.getResponse().getContentAsString()).get("data").get(0).get("id").asText());

        // 2. Create Schedule Item: Topic Review Alert
        Instant futureTime = Instant.now().plus(2, ChronoUnit.HOURS);
        CreateScheduleRequest scheduleReq = new CreateScheduleRequest();
        scheduleReq.setWorkspaceId(workspaceIdA);
        scheduleReq.setTitle("Review Dynamic Programming Knapsack");
        scheduleReq.setDescription("Solve 0/1 knapsack and unbounded knapsack problems before mock interview");
        scheduleReq.setItemType(ScheduleItemType.TOPIC);
        scheduleReq.setScheduledAt(futureTime);
        scheduleReq.setPriority(AlertPriority.HIGH);
        scheduleReq.setSoundEnabled(true);

        MvcResult createResult = mockMvc.perform(post("/api/v1/schedules")
                        .session(sessionA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(scheduleReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title").value("Review Dynamic Programming Knapsack"))
                .andExpect(jsonPath("$.data.itemType").value("TOPIC"))
                .andExpect(jsonPath("$.data.priority").value("HIGH"))
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.soundEnabled").value(true))
                .andReturn();

        UUID scheduleId = UUID.fromString(
                objectMapper.readTree(createResult.getResponse().getContentAsString()).get("data").get("id").asText());

        // 3. List Schedules for Workspace A
        mockMvc.perform(get("/api/v1/schedules")
                        .param("workspaceId", workspaceIdA.toString())
                        .session(sessionA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(scheduleId.toString()));

        // Filter by Status PENDING
        mockMvc.perform(get("/api/v1/schedules")
                        .param("workspaceId", workspaceIdA.toString())
                        .param("status", "PENDING")
                        .session(sessionA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)));

        // Filter by Status COMPLETED (should be empty)
        mockMvc.perform(get("/api/v1/schedules")
                        .param("workspaceId", workspaceIdA.toString())
                        .param("status", "COMPLETED")
                        .session(sessionA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));

        // 4. Update Schedule: Change Priority to URGENT
        UpdateScheduleRequest updateReq = new UpdateScheduleRequest();
        updateReq.setPriority(AlertPriority.URGENT);

        mockMvc.perform(patch("/api/v1/schedules/" + scheduleId)
                        .session(sessionA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.priority").value("URGENT"));

        // 5. Acknowledge Notification
        mockMvc.perform(patch("/api/v1/schedules/" + scheduleId + "/acknowledge")
                        .session(sessionA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.notifiedAt", notNullValue()));

        // 6. Complete Schedule Item
        mockMvc.perform(patch("/api/v1/schedules/" + scheduleId + "/status")
                        .session(sessionA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "COMPLETED"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));

        // 7. Verify Dashboard Integration reflects completed task
        mockMvc.perform(get("/api/v1/analytics/dashboard")
                        .param("workspaceId", workspaceIdA.toString())
                        .session(sessionA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.completedTasksCount").value(1));

        // 8. Register User B and verify Tenant Isolation
        RegisterRequest userReqB = new RegisterRequest(
                "scheduler_bob@lifestack.dev",
                "Password123!",
                "Scheduler Bob",
                "UTC"
        );
        MvcResult regResultB = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userReqB)))
                .andExpect(status().isCreated())
                .andReturn();

        MockHttpSession sessionB = (MockHttpSession) regResultB.getRequest().getSession(false);

        // Bob cannot read Alice's schedule
        mockMvc.perform(get("/api/v1/schedules/" + scheduleId).session(sessionB))
                .andExpect(status().isNotFound());

        // Bob cannot update Alice's schedule
        mockMvc.perform(patch("/api/v1/schedules/" + scheduleId)
                        .session(sessionB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isNotFound());

        // Bob cannot delete Alice's schedule
        mockMvc.perform(delete("/api/v1/schedules/" + scheduleId).session(sessionB))
                .andExpect(status().isNotFound());

        // 9. Alice deletes her schedule
        mockMvc.perform(delete("/api/v1/schedules/" + scheduleId).session(sessionA))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/schedules/" + scheduleId).session(sessionA))
                .andExpect(status().isNotFound());
    }
}

