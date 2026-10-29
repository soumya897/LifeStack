package com.lifestack.analytics;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifestack.coding.dto.CreateProblemRequest;
import com.lifestack.coding.entity.ProblemDifficulty;
import com.lifestack.job.dto.CreateApplicationRequest;
import com.lifestack.job.dto.CreateInterviewRequest;
import com.lifestack.job.dto.UpdateApplicationRequest;
import com.lifestack.job.entity.ApplicationStatus;
import com.lifestack.job.entity.InterviewEventType;
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

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AnalyticsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Should test full analytics endpoints for roadmaps, jobs, monthly velocity, sources and isolation")
    void testFullAnalyticsSuite() throws Exception {
        // 1. Register User 1 (Alice)
        RegisterRequest aliceReq = new RegisterRequest(
                "alice_analytics@lifestack.dev",
                "Password123!",
                "Alice Analytics",
                "UTC"
        );
        MvcResult regAlice = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(aliceReq)))
                .andExpect(status().isCreated())
                .andReturn();
        MockHttpSession aliceSession = (MockHttpSession) regAlice.getRequest().getSession(false);

        // Fetch Alice's default workspace
        MvcResult wsResult = mockMvc.perform(get("/api/v1/workspaces").session(aliceSession))
                .andExpect(status().isOk())
                .andReturn();
        String aliceWsId = objectMapper.readTree(wsResult.getResponse().getContentAsString())
                .path("data").get(0).path("id").asText();
        UUID workspaceId = UUID.fromString(aliceWsId);

        // 2. Register User 2 (Bob)
        RegisterRequest bobReq = new RegisterRequest(
                "bob_analytics@lifestack.dev",
                "Password123!",
                "Bob Analytics",
                "UTC"
        );
        MvcResult regBob = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bobReq)))
                .andExpect(status().isCreated())
                .andReturn();
        MockHttpSession bobSession = (MockHttpSession) regBob.getRequest().getSession(false);

        // 3. Create learning entities for Alice: Roadmap, Topic, Coding Problem
        CreateRoadmapRequest roadmapReq = new CreateRoadmapRequest();
        roadmapReq.setWorkspaceId(workspaceId);
        roadmapReq.setName("Backend Mastery");
        roadmapReq.setDescription("Spring Boot & Microservices");
        roadmapReq.setProgressMode(ProgressMode.TOPIC);
        roadmapReq.setStartDate(LocalDate.now().minusDays(10));
        roadmapReq.setTargetDate(LocalDate.now().plusDays(20));

        MvcResult rmResult = mockMvc.perform(post("/api/v1/roadmaps")
                        .session(aliceSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(roadmapReq)))
                .andExpect(status().isCreated())
                .andReturn();
        String roadmapId = objectMapper.readTree(rmResult.getResponse().getContentAsString())
                .path("data").path("id").asText();

        CreateTopicRequest topicReq = new CreateTopicRequest();
        topicReq.setTitle("RESTful APIs");
        topicReq.setDescription("API design guidelines");
        topicReq.setWeight(1);
        topicReq.setStartDate(LocalDate.now().minusDays(5));
        topicReq.setTargetDate(LocalDate.now().plusDays(5));

        MvcResult topicResult = mockMvc.perform(post("/api/v1/roadmaps/" + roadmapId + "/topics")
                        .session(aliceSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(topicReq)))
                .andExpect(status().isCreated())
                .andReturn();
        String topicId = objectMapper.readTree(topicResult.getResponse().getContentAsString())
                .path("data").path("id").asText();

        CreateProblemRequest problemReq = new CreateProblemRequest();
        problemReq.setTitle("Two Sum");
        problemReq.setDifficulty(ProblemDifficulty.EASY);
        problemReq.setPlatformUrl("https://leetcode.com/problems/two-sum");
        problemReq.setStatement("Array hash map approach");

        mockMvc.perform(post("/api/v1/topics/" + topicId + "/problems")
                        .session(aliceSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(problemReq)))
                .andExpect(status().isCreated());

        // 4. Test GET /api/v1/analytics/roadmaps for Alice
        mockMvc.perform(get("/api/v1/analytics/roadmaps?workspaceId=" + workspaceId).session(aliceSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalRoadmaps").value(1))
                .andExpect(jsonPath("$.data.activeRoadmaps").value(1))
                .andExpect(jsonPath("$.data.totalTopics").value(1))
                .andExpect(jsonPath("$.data.totalProblems").value(1))
                .andExpect(jsonPath("$.data.problemsByDifficulty.EASY").value(1))
                .andExpect(jsonPath("$.data.roadmaps", hasSize(1)))
                .andExpect(jsonPath("$.data.roadmaps[0].name").value("Backend Mastery"));

        // 5. Create job applications for Alice:
        // App 1: Google (LinkedIn, APPLIED -> OFFER)
        CreateApplicationRequest app1Req = new CreateApplicationRequest(
                "Google",
                "Staff Software Engineer",
                "LinkedIn",
                LocalDate.now().minusDays(30),
                ApplicationStatus.APPLIED
        );
        app1Req.setWorkspaceId(workspaceId);
        app1Req.setLocation("Mountain View, CA");

        MvcResult app1Result = mockMvc.perform(post("/api/v1/applications")
                        .session(aliceSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(app1Req)))
                .andExpect(status().isCreated())
                .andReturn();
        String app1Id = objectMapper.readTree(app1Result.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // Move App 1 to OFFER
        UpdateApplicationRequest app1Update = new UpdateApplicationRequest();
        app1Update.setStatus(ApplicationStatus.OFFER);
        mockMvc.perform(patch("/api/v1/applications/" + app1Id)
                        .session(aliceSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(app1Update)))
                .andExpect(status().isOk());

        // Add Interview for App 1
        CreateInterviewRequest interviewReq = new CreateInterviewRequest(
                "System Design Round",
                InterviewEventType.TECHNICAL,
                Instant.now().minusSeconds(86400 * 5)
        );
        interviewReq.setNotes("Practice concurrency");
        mockMvc.perform(post("/api/v1/applications/" + app1Id + "/interviews")
                        .session(aliceSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(interviewReq)))
                .andExpect(status().isCreated());

        // App 2: Meta (Referral, APPLIED)
        CreateApplicationRequest app2Req = new CreateApplicationRequest(
                "Meta",
                "Frontend Engineer",
                "Referral",
                LocalDate.now().minusDays(5),
                ApplicationStatus.APPLIED
        );
        app2Req.setWorkspaceId(workspaceId);
        app2Req.setLocation("Menlo Park, CA");

        mockMvc.perform(post("/api/v1/applications")
                        .session(aliceSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(app2Req)))
                .andExpect(status().isCreated());

        // 6. Test GET /api/v1/analytics/jobs/summary for Alice
        mockMvc.perform(get("/api/v1/analytics/jobs/summary?workspaceId=" + workspaceId).session(aliceSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalApplications").value(2))
                .andExpect(jsonPath("$.data.offersCount").value(1))
                .andExpect(jsonPath("$.data.offerRatePercentage").value(50.0))
                .andExpect(jsonPath("$.data.byStatus.OFFER").value(1))
                .andExpect(jsonPath("$.data.byStatus.APPLIED").value(1))
                .andExpect(jsonPath("$.data.stageFunnel", hasSize(greaterThanOrEqualTo(1))));

        // 7. Test GET /api/v1/analytics/jobs/monthly for Alice
        mockMvc.perform(get("/api/v1/analytics/jobs/monthly?workspaceId=" + workspaceId).session(aliceSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.months", hasSize(greaterThanOrEqualTo(1))));

        // 8. Test GET /api/v1/analytics/jobs/by-source for Alice
        mockMvc.perform(get("/api/v1/analytics/jobs/by-source?workspaceId=" + workspaceId).session(aliceSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.sources", hasSize(2)));

        // 9. Test GET /api/v1/analytics/jobs/interviews for Alice
        mockMvc.perform(get("/api/v1/analytics/jobs/interviews?workspaceId=" + workspaceId).session(aliceSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalInterviews").value(1))
                .andExpect(jsonPath("$.data.byRoundType.TECHNICAL").value(1));

        // 10. Multi-tenant security check: Bob trying to access Alice's workspace analytics gets 404
        mockMvc.perform(get("/api/v1/analytics/roadmaps?workspaceId=" + workspaceId).session(bobSession))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));

        mockMvc.perform(get("/api/v1/analytics/jobs/summary?workspaceId=" + workspaceId).session(bobSession))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }
}
