package com.lifestack.note;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifestack.learning.dto.CreateRoadmapRequest;
import com.lifestack.learning.dto.CreateTopicRequest;
import com.lifestack.learning.entity.ProgressMode;
import com.lifestack.note.dto.CreateNoteRequest;
import com.lifestack.note.dto.CreateResourceRequest;
import com.lifestack.note.dto.UpdateNoteRequest;
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
class NoteResourceIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Notes & Resources Lifecycle: Create, Search by Keyword/Tag, Link to Topic, and Tenant Isolation")
    void testNotesAndResourcesLifecycle() throws Exception {
        // 1. Register User A
        RegisterRequest userReq = new RegisterRequest(
                "writer_alice@lifestack.dev",
                "Password123!",
                "Writer Alice",
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
        rmReq.setName("Java Core");
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
        topicReq.setTitle("Garbage Collection & JVM");
        topicReq.setWeight(1);

        MvcResult topicResult = mockMvc.perform(post("/api/v1/roadmaps/" + roadmapId + "/topics")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(topicReq)))
                .andExpect(status().isCreated())
                .andReturn();
        UUID topicId = UUID.fromString(
                objectMapper.readTree(topicResult.getResponse().getContentAsString()).get("data").get("id").asText());

        // 2. Create Standalone Note
        CreateNoteRequest noteReq = new CreateNoteRequest();
        noteReq.setWorkspaceId(workspaceId);
        noteReq.setTitle("G1 GC Tuning Guide");
        noteReq.setContent("The G1 garbage collector divides the heap into equal sized regions.");
        noteReq.setTags("jvm,performance,gc");

        MvcResult noteResult = mockMvc.perform(post("/api/v1/notes")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(noteReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title").value("G1 GC Tuning Guide"))
                .andExpect(jsonPath("$.data.tags").value("jvm,performance,gc"))
                .andReturn();
        UUID noteId = UUID.fromString(
                objectMapper.readTree(noteResult.getResponse().getContentAsString()).get("data").get("id").asText());

        // 3. Search Note by tag/keyword
        mockMvc.perform(get("/api/v1/notes")
                        .param("workspaceId", workspaceId.toString())
                        .param("search", "tuning")
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(noteId.toString()));

        mockMvc.perform(get("/api/v1/notes")
                        .param("workspaceId", workspaceId.toString())
                        .param("search", "nonexistent")
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));

        // 4. Link Note to Topic
        mockMvc.perform(post("/api/v1/topics/" + topicId + "/notes/" + noteId).session(session))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/topics/" + topicId + "/notes").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(noteId.toString()));

        // 5. Create Resource and link to Topic
        CreateResourceRequest resourceReq = new CreateResourceRequest();
        resourceReq.setWorkspaceId(workspaceId);
        resourceReq.setName("Oracle JVM GC Whitepaper");
        resourceReq.setResourceType("DOCUMENTATION");
        resourceReq.setUrl("https://docs.oracle.com/en/java/javase/21/gctuning");
        resourceReq.setTopicId(topicId);

        MvcResult resResult = mockMvc.perform(post("/api/v1/resources")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resourceReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Oracle JVM GC Whitepaper"))
                .andReturn();
        UUID resourceId = UUID.fromString(
                objectMapper.readTree(resResult.getResponse().getContentAsString()).get("data").get("id").asText());

        mockMvc.perform(get("/api/v1/topics/" + topicId + "/resources").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(resourceId.toString()));

        // 6. Tenant Isolation check: Register User B
        RegisterRequest userBReq = new RegisterRequest(
                "writer_bob@lifestack.dev",
                "Password123!",
                "Writer Bob",
                "UTC"
        );
        MvcResult regB = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userBReq)))
                .andExpect(status().isCreated())
                .andReturn();
        MockHttpSession sessionB = (MockHttpSession) regB.getRequest().getSession(false);

        // Bob cannot read, edit, or delete Alice's note or resource
        mockMvc.perform(get("/api/v1/notes/" + noteId).session(sessionB))
                .andExpect(status().isNotFound());

        UpdateNoteRequest hackNote = new UpdateNoteRequest();
        hackNote.setTitle("Hacked Note");
        mockMvc.perform(patch("/api/v1/notes/" + noteId)
                        .session(sessionB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(hackNote)))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/v1/notes/" + noteId).session(sessionB))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/v1/resources/" + resourceId).session(sessionB))
                .andExpect(status().isNotFound());
    }
}
