package com.lifestack.learning;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifestack.learning.dto.*;
import com.lifestack.learning.entity.ProgressMode;
import com.lifestack.learning.entity.RoadmapStatus;
import com.lifestack.learning.entity.TopicStatus;
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
import java.util.Arrays;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RoadmapTopicIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("End-to-End Roadmap and Topic Lifecycle: Create, Order, Complete Topic, Progress Recalculation, and Dashboard Integration")
    void testRoadmapTopicLifecycleAndProgress() throws Exception {
        // 1. Register User A
        RegisterRequest userAReq = new RegisterRequest(
                "alice_learner@lifestack.dev",
                "Password123!",
                "Alice Learner",
                "America/New_York"
        );
        MvcResult regA = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userAReq)))
                .andExpect(status().isCreated())
                .andReturn();

        MockHttpSession sessionA = (MockHttpSession) regA.getRequest().getSession(false);

        // Fetch user A default workspace
        MvcResult wsResult = mockMvc.perform(get("/api/v1/workspaces").session(sessionA))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode wsNode = objectMapper.readTree(wsResult.getResponse().getContentAsString()).get("data");
        UUID workspaceAId = UUID.fromString(wsNode.get(0).get("id").asText());

        // 2. Initial state: Roadmaps list should be empty
        mockMvc.perform(get("/api/v1/roadmaps")
                        .param("workspaceId", workspaceAId.toString())
                        .session(sessionA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));

        // 3. Create a Roadmap ("DSA Roadmap", TOPIC progress mode)
        CreateRoadmapRequest createRoadmapReq = new CreateRoadmapRequest();
        createRoadmapReq.setWorkspaceId(workspaceAId);
        createRoadmapReq.setName("DSA Roadmap");
        createRoadmapReq.setDescription("Master core algorithms and data structures");
        createRoadmapReq.setProgressMode(ProgressMode.TOPIC);
        createRoadmapReq.setStartDate(LocalDate.now());
        createRoadmapReq.setTargetDate(LocalDate.now().plusMonths(3));

        MvcResult createRoadmapResult = mockMvc.perform(post("/api/v1/roadmaps")
                        .session(sessionA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRoadmapReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("DSA Roadmap"))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.progressPercentage").value(0.0))
                .andExpect(jsonPath("$.data.totalTopics").value(0))
                .andReturn();

        UUID roadmapId = UUID.fromString(objectMapper.readTree(
                createRoadmapResult.getResponse().getContentAsString()).get("data").get("id").asText());

        // 4. Add First Topic ("ArrayList")
        CreateTopicRequest topic1Req = new CreateTopicRequest();
        topic1Req.setTitle("ArrayList");
        topic1Req.setDescription("Dynamic arrays, resizing amortized O(1), memory layout");
        topic1Req.setWeight(1);
        topic1Req.setStartDate(LocalDate.now());
        topic1Req.setTargetDate(LocalDate.now().plusWeeks(1));

        MvcResult topic1Result = mockMvc.perform(post("/api/v1/roadmaps/" + roadmapId + "/topics")
                        .session(sessionA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(topic1Req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title").value("ArrayList"))
                .andExpect(jsonPath("$.data.status").value("NOT_STARTED"))
                .andExpect(jsonPath("$.data.sortOrder").value(0))
                .andReturn();

        UUID topic1Id = UUID.fromString(objectMapper.readTree(
                topic1Result.getResponse().getContentAsString()).get("data").get("id").asText());

        // 5. Add Second Topic ("LinkedList")
        CreateTopicRequest topic2Req = new CreateTopicRequest();
        topic2Req.setTitle("LinkedList");
        topic2Req.setDescription("Singly and doubly linked lists, pointer manipulation");
        topic2Req.setWeight(1);
        topic2Req.setStartDate(LocalDate.now().plusWeeks(1));
        topic2Req.setTargetDate(LocalDate.now().plusWeeks(2));

        MvcResult topic2Result = mockMvc.perform(post("/api/v1/roadmaps/" + roadmapId + "/topics")
                        .session(sessionA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(topic2Req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title").value("LinkedList"))
                .andExpect(jsonPath("$.data.sortOrder").value(1))
                .andReturn();

        UUID topic2Id = UUID.fromString(objectMapper.readTree(
                topic2Result.getResponse().getContentAsString()).get("data").get("id").asText());

        // 6. Verify Roadmap detail reports 2 topics and 0.0% progress
        mockMvc.perform(get("/api/v1/roadmaps/" + roadmapId).session(sessionA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalTopics").value(2))
                .andExpect(jsonPath("$.data.completedTopics").value(0))
                .andExpect(jsonPath("$.data.progressPercentage").value(0.0))
                .andExpect(jsonPath("$.data.topics", hasSize(2)));

        // 7. Reorder Topics: Move LinkedList before ArrayList
        ReorderTopicsRequest reorderReq = new ReorderTopicsRequest(Arrays.asList(topic2Id, topic1Id));
        mockMvc.perform(put("/api/v1/roadmaps/" + roadmapId + "/topics/reorder")
                        .session(sessionA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reorderReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value(topic2Id.toString()))
                .andExpect(jsonPath("$.data[0].sortOrder").value(0))
                .andExpect(jsonPath("$.data[1].id").value(topic1Id.toString()))
                .andExpect(jsonPath("$.data[1].sortOrder").value(1));

        // 8. Mark ArrayList topic as COMPLETED
        UpdateTopicStatusRequest statusReq = new UpdateTopicStatusRequest(TopicStatus.COMPLETED);
        mockMvc.perform(patch("/api/v1/topics/" + topic1Id + "/status")
                        .session(sessionA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.completedAt").isNotEmpty());

        // 9. Verify Roadmap recalculates progress to 50.0% (1 of 2 topics)
        mockMvc.perform(get("/api/v1/roadmaps/" + roadmapId).session(sessionA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.completedTopics").value(1))
                .andExpect(jsonPath("$.data.progressPercentage").value(50.0));

        // 10. Mark LinkedList topic as COMPLETED -> 100.0% progress
        mockMvc.perform(patch("/api/v1/topics/" + topic2Id + "/status")
                        .session(sessionA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));

        mockMvc.perform(get("/api/v1/roadmaps/" + roadmapId).session(sessionA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.completedTopics").value(2))
                .andExpect(jsonPath("$.data.progressPercentage").value(100.0));

        // 11. Mark Roadmap as COMPLETED
        UpdateRoadmapRequest updateRoadmapReq = new UpdateRoadmapRequest();
        updateRoadmapReq.setStatus(RoadmapStatus.COMPLETED);
        mockMvc.perform(patch("/api/v1/roadmaps/" + roadmapId)
                        .session(sessionA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRoadmapReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.completedAt").isNotEmpty());

        // 12. Verify Dashboard aggregation reflects the completed roadmap
        mockMvc.perform(get("/api/v1/analytics/dashboard")
                        .param("workspaceId", workspaceAId.toString())
                        .session(sessionA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.completedRoadmapsCount").value(1))
                .andExpect(jsonPath("$.data.activeRoadmapsCount").value(0));

        // 13. Tenant Isolation Tests: Register User B
        RegisterRequest userBReq = new RegisterRequest(
                "bob_attacker@lifestack.dev",
                "Password123!",
                "Bob Attacker",
                "UTC"
        );
        MvcResult regB = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userBReq)))
                .andExpect(status().isCreated())
                .andReturn();

        MockHttpSession sessionB = (MockHttpSession) regB.getRequest().getSession(false);

        // Bob tries to access Alice's roadmap -> 404 Not Found
        mockMvc.perform(get("/api/v1/roadmaps/" + roadmapId).session(sessionB))
                .andExpect(status().isNotFound());

        // Bob tries to add topic to Alice's roadmap -> 404 Not Found
        CreateTopicRequest maliciousTopic = new CreateTopicRequest();
        maliciousTopic.setTitle("Hacked Topic");
        mockMvc.perform(post("/api/v1/roadmaps/" + roadmapId + "/topics")
                        .session(sessionB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(maliciousTopic)))
                .andExpect(status().isNotFound());

        // Bob tries to access Alice's topic -> 404 Not Found
        mockMvc.perform(get("/api/v1/topics/" + topic1Id).session(sessionB))
                .andExpect(status().isNotFound());

        // Bob tries to update Alice's topic -> 404 Not Found
        mockMvc.perform(patch("/api/v1/topics/" + topic1Id + "/status")
                        .session(sessionB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusReq)))
                .andExpect(status().isNotFound());

        // Bob tries to delete Alice's topic -> 404 Not Found
        mockMvc.perform(delete("/api/v1/topics/" + topic1Id).session(sessionB))
                .andExpect(status().isNotFound());

        // Bob tries to delete Alice's roadmap -> 404 Not Found
        mockMvc.perform(delete("/api/v1/roadmaps/" + roadmapId).session(sessionB))
                .andExpect(status().isNotFound());
    }
}
