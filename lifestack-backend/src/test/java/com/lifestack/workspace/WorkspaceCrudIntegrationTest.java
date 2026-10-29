package com.lifestack.workspace;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifestack.user.dto.RegisterRequest;
import com.lifestack.workspace.dto.CreateWorkspaceRequest;
import com.lifestack.workspace.dto.UpdateWorkspaceRequest;
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

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class WorkspaceCrudIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Complete Workspace CRUD: Create, Read, Update, Delete, and Deletion Guard")
    void testWorkspaceLifecycleAndGuard() throws Exception {
        // 1. Register user
        RegisterRequest registerReq = new RegisterRequest(
                "ws_tester@lifestack.dev",
                "Password123!",
                "Workspace Tester",
                "UTC"
        );
        MvcResult regResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        MockHttpSession session = (MockHttpSession) regResult.getRequest().getSession(false);

        // 2. Initial state: 1 default workspace
        MvcResult listResult = mockMvc.perform(get("/api/v1/workspaces").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andReturn();

        JsonNode initialWorkspaces = objectMapper.readTree(listResult.getResponse().getContentAsString()).get("data");
        String defaultWorkspaceId = initialWorkspaces.get(0).get("id").asText();

        // 3. Attempting to delete the ONLY workspace must fail with 400 Bad Request
        mockMvc.perform(delete("/api/v1/workspaces/" + defaultWorkspaceId).session(session))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Cannot delete your only workspace"));

        // 4. Create a second workspace
        CreateWorkspaceRequest createReq = new CreateWorkspaceRequest("Career Projects", "Tracking job search");
        MvcResult createResult = mockMvc.perform(post("/api/v1/workspaces")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Career Projects"))
                .andReturn();

        String secondWorkspaceId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("data").get("id").asText();

        // Verify count is now 2
        mockMvc.perform(get("/api/v1/workspaces").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)));

        // 5. Update second workspace (PATCH)
        UpdateWorkspaceRequest updateReq = new UpdateWorkspaceRequest("Career & Opportunities", "Updated description", null);
        mockMvc.perform(patch("/api/v1/workspaces/" + secondWorkspaceId)
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Career & Opportunities"))
                .andExpect(jsonPath("$.data.description").value("Updated description"));

        // Verify by GET by ID
        mockMvc.perform(get("/api/v1/workspaces/" + secondWorkspaceId).session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Career & Opportunities"));

        // 6. Delete the second workspace (now allowed because user still has default workspace)
        mockMvc.perform(delete("/api/v1/workspaces/" + secondWorkspaceId).session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // 7. Verify only 1 workspace remains
        mockMvc.perform(get("/api/v1/workspaces").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)));
    }
}
