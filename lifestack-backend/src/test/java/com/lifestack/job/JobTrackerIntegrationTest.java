package com.lifestack.job;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifestack.job.dto.CreateApplicationRequest;
import com.lifestack.job.dto.CreateInterviewRequest;
import com.lifestack.job.dto.UpdateApplicationRequest;
import com.lifestack.job.dto.UpdateInterviewRequest;
import com.lifestack.job.entity.*;
import com.lifestack.note.dto.CreateNoteRequest;
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
class JobTrackerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Job Tracker Lifecycle: Application CRUD, Interview Events, History, Analytics & Isolation")
    void testJobTrackerCompleteLifecycle() throws Exception {
        // 1. Register User Alice
        RegisterRequest aliceReq = new RegisterRequest(
                "alice_jobs@lifestack.dev",
                "Password123!",
                "Alice JobHunter",
                "UTC"
        );
        MvcResult regAlice = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(aliceReq)))
                .andExpect(status().isCreated())
                .andReturn();
        MockHttpSession aliceSession = (MockHttpSession) regAlice.getRequest().getSession(false);

        // Fetch Alice's default workspace
        MvcResult wsResult = mockMvc.perform(get("/api/v1/workspaces")
                        .session(aliceSession))
                .andExpect(status().isOk())
                .andReturn();
        String aliceWorkspaceIdStr = objectMapper.readTree(wsResult.getResponse().getContentAsString())
                .path("data").get(0).path("id").asText();
        UUID aliceWorkspaceId = UUID.fromString(aliceWorkspaceIdStr);

        // 2. Register User Bob
        RegisterRequest bobReq = new RegisterRequest(
                "bob_jobs@lifestack.dev",
                "Password123!",
                "Bob Competitor",
                "UTC"
        );
        MvcResult regBob = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bobReq)))
                .andExpect(status().isCreated())
                .andReturn();
        MockHttpSession bobSession = (MockHttpSession) regBob.getRequest().getSession(false);

        // 3. Alice creates a preparation note
        CreateNoteRequest noteReq = new CreateNoteRequest();
        noteReq.setWorkspaceId(aliceWorkspaceId);
        noteReq.setTitle("Google System Design Prep");
        noteReq.setContent("Prepare rate limiting, distributed caching, and microservice resilience.");
        noteReq.setTags("system-design,google");

        MvcResult noteResult = mockMvc.perform(post("/api/v1/notes")
                        .session(aliceSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(noteReq)))
                .andExpect(status().isCreated())
                .andReturn();
        String noteIdStr = objectMapper.readTree(noteResult.getResponse().getContentAsString()).path("data").path("id").asText();
        UUID noteId = UUID.fromString(noteIdStr);

        // 4. Alice creates a Job Application for Google
        CreateApplicationRequest appReq = new CreateApplicationRequest(
                "Google",
                "Senior Full Stack Engineer",
                "LinkedIn",
                LocalDate.now(),
                ApplicationStatus.APPLIED
        );
        appReq.setWorkspaceId(aliceWorkspaceId);
        appReq.setJobUrl("https://careers.google.com/jobs/results/12345");
        appReq.setLocation("Mountain View, CA");
        appReq.setWorkMode(WorkMode.HYBRID);
        appReq.setSalary("$180,000 - $220,000");
        appReq.setNotes("Referred by college alumni. Initial recruiter screening next week.");
        appReq.setFollowUpAt(LocalDate.now().plusDays(7));
        appReq.setInitialHistoryNote("Applied via LinkedIn referral link");

        MvcResult appResult = mockMvc.perform(post("/api/v1/applications")
                        .session(aliceSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(appReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.companyName").value("Google"))
                .andExpect(jsonPath("$.data.jobTitle").value("Senior Full Stack Engineer"))
                .andExpect(jsonPath("$.data.status").value("APPLIED"))
                .andExpect(jsonPath("$.data.workMode").value("HYBRID"))
                .andReturn();

        String appIdStr = objectMapper.readTree(appResult.getResponse().getContentAsString()).path("data").path("id").asText();
        UUID applicationId = UUID.fromString(appIdStr);

        // 5. Verify Alice lists applications with filtering and pagination
        mockMvc.perform(get("/api/v1/applications")
                        .session(aliceSession)
                        .param("status", "APPLIED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].companyName").value("Google"));

        // 6. Alice schedules an interview event: "Technical Round 1"
        CreateInterviewRequest round1 = new CreateInterviewRequest(
                "Technical Coding Round 1",
                InterviewEventType.TECHNICAL,
                Instant.now().plusSeconds(86400) // tomorrow
        );
        round1.setNotes("Focus on Data Structures and Concurrency.");

        MvcResult intResult = mockMvc.perform(post("/api/v1/applications/" + applicationId + "/interviews")
                        .session(aliceSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(round1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.roundName").value("Technical Coding Round 1"))
                .andExpect(jsonPath("$.data.eventType").value("TECHNICAL"))
                .andExpect(jsonPath("$.data.status").value("SCHEDULED"))
                .andReturn();

        String interviewIdStr = objectMapper.readTree(intResult.getResponse().getContentAsString()).path("data").path("id").asText();
        UUID interviewId = UUID.fromString(interviewIdStr);

        // 7. Verify application status auto-progressed to INTERVIEW
        mockMvc.perform(get("/api/v1/applications/" + applicationId)
                        .session(aliceSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("INTERVIEW"))
                .andExpect(jsonPath("$.data.interviews", hasSize(1)))
                .andExpect(jsonPath("$.data.history", hasSize(2))); // Initial creation + auto progress

        // 8. Alice links preparation note to Google application
        mockMvc.perform(post("/api/v1/applications/" + applicationId + "/notes/" + noteId)
                        .session(aliceSession))
                .andExpect(status().isOk());

        // 9. Alice updates interview outcome to OFFER
        UpdateInterviewRequest updateInt = new UpdateInterviewRequest();
        updateInt.setStatus(InterviewStatus.COMPLETED);
        updateInt.setResult(InterviewResult.OFFER);
        updateInt.setNotes("Aced system design and coding questions. Recruiter extended verbal offer!");

        mockMvc.perform(patch("/api/v1/interviews/" + interviewId)
                        .session(aliceSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateInt)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.result").value("OFFER"));

        // 10. Verify application status progressed to OFFER with full history
        mockMvc.perform(get("/api/v1/applications/" + applicationId)
                        .session(aliceSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("OFFER"))
                .andExpect(jsonPath("$.data.attachedNoteIds", hasSize(1)))
                .andExpect(jsonPath("$.data.attachedNoteIds[0]").value(noteIdStr))
                .andExpect(jsonPath("$.data.history", hasSize(3)));

        // 11. Alice checks job stats summary
        mockMvc.perform(get("/api/v1/applications/stats")
                        .session(aliceSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalApplications").value(1))
                .andExpect(jsonPath("$.data.appliedThisMonth").value(1))
                .andExpect(jsonPath("$.data.offersCount").value(1));

        // 12. Check Dashboard summary incorporates job activity
        mockMvc.perform(get("/api/v1/analytics/dashboard")
                        .session(aliceSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.applicationsSubmittedThisMonthCount").value(1))
                .andExpect(jsonPath("$.data.recentActivity", hasItem(hasEntry("type", "JOB_APPLICATION"))));

        // 13. Multi-tenancy check: Bob cannot access Alice's application
        mockMvc.perform(get("/api/v1/applications/" + applicationId)
                        .session(bobSession))
                .andExpect(status().isNotFound());

        // Bob cannot schedule interviews on Alice's application
        mockMvc.perform(post("/api/v1/applications/" + applicationId + "/interviews")
                        .session(bobSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(round1)))
                .andExpect(status().isNotFound());

        // Bob cannot update Alice's interview
        mockMvc.perform(patch("/api/v1/interviews/" + interviewId)
                        .session(bobSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateInt)))
                .andExpect(status().isNotFound());

        // 14. Alice deletes the application
        mockMvc.perform(delete("/api/v1/applications/" + applicationId)
                        .session(aliceSession))
                .andExpect(status().isOk());

        // Verify it is gone
        mockMvc.perform(get("/api/v1/applications/" + applicationId)
                        .session(aliceSession))
                .andExpect(status().isNotFound());
    }
}
