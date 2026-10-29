package com.lifestack.analytics;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifestack.user.dto.RegisterRequest;
import com.lifestack.workspace.dto.CreateWorkspaceRequest;
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

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DashboardIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Should fetch aggregated dashboard summary for default and specific workspaces")
    void testDashboardSummaryAggregation() throws Exception {
        RegisterRequest registerReq = new RegisterRequest(
                "dash_user@lifestack.dev",
                "Password123!",
                "Dashboard User",
                "UTC"
        );
        MvcResult regResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        MockHttpSession session = (MockHttpSession) regResult.getRequest().getSession(false);

        // 1. Fetch default dashboard summary (without workspaceId param)
        mockMvc.perform(get("/api/v1/analytics/dashboard").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.workspaceName").value("Personal Workspace"))
                .andExpect(jsonPath("$.data.activeRoadmapsCount").value(0))
                .andExpect(jsonPath("$.data.recentActivity").isArray());

        // 2. Create another workspace
        CreateWorkspaceRequest createWs = new CreateWorkspaceRequest("Advanced Studies", "DSA & Algorithms");
        MvcResult wsResult = mockMvc.perform(post("/api/v1/workspaces")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createWs)))
                .andExpect(status().isCreated())
                .andReturn();

        String secondWsId = objectMapper.readTree(wsResult.getResponse().getContentAsString())
                .get("data").get("id").asText();

        // 3. Query dashboard explicitly for second workspace
        mockMvc.perform(get("/api/v1/analytics/dashboard?workspaceId=" + secondWsId).session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.workspaceName").value("Advanced Studies"));

        // 4. Query with non-existent workspace ID -> should return 404
        mockMvc.perform(get("/api/v1/analytics/dashboard?workspaceId=" + UUID.randomUUID()).session(session))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }
}

