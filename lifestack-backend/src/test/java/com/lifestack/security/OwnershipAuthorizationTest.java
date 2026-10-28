package com.lifestack.security;

import com.fasterxml.jackson.databind.JsonNode;
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

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OwnershipAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Critical Tenant Isolation: User B cannot view, list, or delete User A's workspace")
    void userCannotAccessOrMutateAnotherUsersWorkspace() throws Exception {
        // 1. Register User A and create a workspace
        RegisterRequest userAReq = new RegisterRequest("user_a@lifestack.dev", "Password123!", "Alice", "UTC");
        MvcResult userARegResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userAReq)))
                .andExpect(status().isCreated())
                .andReturn();

        MockHttpSession userASession = (MockHttpSession) userARegResult.getRequest().getSession(false);

        // User A creates a dedicated workspace
        CreateWorkspaceRequest wsReq = new CreateWorkspaceRequest("Alice Private Workspace", "Secret projects");
        MvcResult wsResult = mockMvc.perform(post("/api/v1/workspaces")
                        .session(userASession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wsReq)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode wsJson = objectMapper.readTree(wsResult.getResponse().getContentAsString());
        String userAWorkspaceId = wsJson.get("data").get("id").asText();

        // 2. Register User B
        RegisterRequest userBReq = new RegisterRequest("user_b@lifestack.dev", "Password123!", "Bob", "UTC");
        MvcResult userBRegResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userBReq)))
                .andExpect(status().isCreated())
                .andReturn();

        MockHttpSession userBSession = (MockHttpSession) userBRegResult.getRequest().getSession(false);

        // 3. User B tries to read User A's workspace by ID -> MUST return 404 Not Found (no leakage)
        mockMvc.perform(get("/api/v1/workspaces/" + userAWorkspaceId)
                        .session(userBSession))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));

        // 4. User B lists workspaces -> MUST only contain User B's default workspace (size = 1)
        mockMvc.perform(get("/api/v1/workspaces")
                        .session(userBSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].name").value("Personal Workspace"));

        // 5. User B tries to delete User A's workspace -> MUST return 404 Not Found
        mockMvc.perform(delete("/api/v1/workspaces/" + userAWorkspaceId)
                        .session(userBSession))
                .andExpect(status().isNotFound());

        // 6. User A verifies their workspace is intact and unchanged
        mockMvc.perform(get("/api/v1/workspaces/" + userAWorkspaceId)
                        .session(userASession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Alice Private Workspace"));
    }
}

