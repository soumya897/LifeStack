package com.lifestack.coding;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifestack.coding.dto.CreateProblemRequest;
import com.lifestack.coding.dto.CreateSolutionRequest;
import com.lifestack.coding.dto.UpdateProblemRequest;
import com.lifestack.coding.entity.ProblemDifficulty;
import com.lifestack.coding.entity.ProblemStatus;
import com.lifestack.learning.dto.CreateRoadmapRequest;
import com.lifestack.learning.dto.CreateTopicRequest;
import com.lifestack.learning.entity.ProgressMode;
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

import java.time.LocalDate;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CodingProblemIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Coding Practice Lifecycle: Problem Creation, Solution Saving, Complexity Tracking, Status Independence, and Isolation")
    void testCodingProblemLifecycle() throws Exception {
        // 1. Register User A
        RegisterRequest userReq = new RegisterRequest(
                "coder_alice@lifestack.dev",
                "Password123!",
                "Coder Alice",
                "UTC"
        );
        MvcResult regResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userReq)))
                .andExpect(status().isCreated())
                .andReturn();

        MockHttpSession session = (MockHttpSession) regResult.getRequest().getSession(false);

        // Fetch workspace
        MvcResult wsResult = mockMvc.perform(get("/api/v1/workspaces").session(session))
                .andExpect(status().isOk())
                .andReturn();
        UUID workspaceId = UUID.fromString(
                objectMapper.readTree(wsResult.getResponse().getContentAsString()).get("data").get(0).get("id").asText());

        // Create Roadmap & Topic
        CreateRoadmapRequest rmReq = new CreateRoadmapRequest();
        rmReq.setWorkspaceId(workspaceId);
        rmReq.setName("DSA Master");
        rmReq.setProgressMode(ProgressMode.TOPIC);
        rmReq.setStartDate(LocalDate.now());

        MvcResult rmResult = mockMvc.perform(post("/api/v1/roadmaps")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rmReq)))
                .andExpect(status().isCreated())
                .andReturn();
        UUID roadmapId = UUID.fromString(
                objectMapper.readTree(rmResult.getResponse().getContentAsString()).get("data").get("id").asText());

        CreateTopicRequest topicReq = new CreateTopicRequest();
        topicReq.setTitle("ArrayList Implementation");
        topicReq.setWeight(1);

        MvcResult topicResult = mockMvc.perform(post("/api/v1/roadmaps/" + roadmapId + "/topics")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(topicReq)))
                .andExpect(status().isCreated())
                .andReturn();
        UUID topicId = UUID.fromString(
                objectMapper.readTree(topicResult.getResponse().getContentAsString()).get("data").get("id").asText());

        // 2. Create Coding Problem
        CreateProblemRequest problemReq = new CreateProblemRequest();
        problemReq.setTitle("Dynamic Array Resizing");
        problemReq.setStatement("Implement a resizable dynamic array with amortized O(1) append.");
        problemReq.setDifficulty(ProblemDifficulty.MEDIUM);
        problemReq.setPlatformUrl("https://leetcode.com/problems/design-dynamic-array");

        MvcResult problemResult = mockMvc.perform(post("/api/v1/topics/" + topicId + "/problems")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(problemReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title").value("Dynamic Array Resizing"))
                .andExpect(jsonPath("$.data.difficulty").value("MEDIUM"))
                .andExpect(jsonPath("$.data.status").value("UNSOLVED"))
                .andReturn();

        UUID problemId = UUID.fromString(
                objectMapper.readTree(problemResult.getResponse().getContentAsString()).get("data").get("id").asText());

        // 3. Save Solution (Java)
        CreateSolutionRequest solutionReq = new CreateSolutionRequest();
        solutionReq.setLanguage("Java");
        solutionReq.setCode("public class MyList { private int[] data = new int[10]; ... }");
        solutionReq.setApproach("Double capacity when count reaches length.");
        solutionReq.setTimeComplexity("O(1) amortized");
        solutionReq.setSpaceComplexity("O(N)");

        mockMvc.perform(post("/api/v1/problems/" + problemId + "/solutions")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(solutionReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.language").value("Java"))
                .andExpect(jsonPath("$.data.timeComplexity").value("O(1) amortized"))
                .andExpect(jsonPath("$.data.spaceComplexity").value("O(N)"));

        // 4. Verify problem status transitioned to SOLVED, but topic remains NOT_STARTED (Section 16 requirement)
        mockMvc.perform(get("/api/v1/problems/" + problemId).session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SOLVED"))
                .andExpect(jsonPath("$.data.solutionsCount").value(1));

        mockMvc.perform(get("/api/v1/topics/" + topicId).session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("NOT_STARTED")); // Verified distinct from problem mastery

        mockMvc.perform(get("/api/v1/roadmaps/" + roadmapId).session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.progressPercentage").value(0.0)); // Verified 0% until topic complete

        // 5. Query problems across workspace with filter
        mockMvc.perform(get("/api/v1/problems")
                        .param("workspaceId", workspaceId.toString())
                        .param("difficulty", "MEDIUM")
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(problemId.toString()));

        // 6. Tenant Isolation check: Register User B
        RegisterRequest userBReq = new RegisterRequest(
                "coder_bob@lifestack.dev",
                "Password123!",
                "Coder Bob",
                "UTC"
        );
        MvcResult regB = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userBReq)))
                .andExpect(status().isCreated())
                .andReturn();
        MockHttpSession sessionB = (MockHttpSession) regB.getRequest().getSession(false);

        // Bob cannot view, update, or delete Alice's problem
        mockMvc.perform(get("/api/v1/problems/" + problemId).session(sessionB))
                .andExpect(status().isNotFound());

        UpdateProblemRequest hackReq = new UpdateProblemRequest();
        hackReq.setTitle("Hacked Problem");
        mockMvc.perform(patch("/api/v1/problems/" + problemId)
                        .session(sessionB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(hackReq)))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/v1/problems/" + problemId).session(sessionB))
                .andExpect(status().isNotFound());
    }
}
