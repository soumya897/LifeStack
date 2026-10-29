package com.lifestack.template;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifestack.customrecord.dto.CreateCustomRecordRequest;
import com.lifestack.job.dto.CreateApplicationRequest;
import com.lifestack.template.dto.CreateFieldDefinitionRequest;
import com.lifestack.template.dto.CreateTemplateRequest;
import com.lifestack.template.entity.FieldType;
import com.lifestack.template.entity.TemplateRecordType;
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

import java.util.*;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TemplateCustomFieldIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Milestone 7: Custom Templates, Immutability, Field Validation, Applications Integration & Isolation")
    void testCustomTemplatesEndToEnd() throws Exception {
        // 1. Register Alice
        RegisterRequest aliceReq = new RegisterRequest(
                "alice_templates@lifestack.dev",
                "Password123!",
                "Alice Templates",
                "UTC"
        );
        MvcResult regAlice = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(aliceReq)))
                .andExpect(status().isCreated())
                .andReturn();
        MockHttpSession aliceSession = (MockHttpSession) regAlice.getRequest().getSession(false);

        // Fetch Alice's workspace
        MvcResult wsResult = mockMvc.perform(get("/api/v1/workspaces")
                        .session(aliceSession))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode wsNode = objectMapper.readTree(wsResult.getResponse().getContentAsString());
        String workspaceId = wsNode.get("data").get(0).get("id").asText();

        // 2. Alice creates a Job Application Template
        CreateTemplateRequest createTpl = new CreateTemplateRequest();
        createTpl.setWorkspaceId(UUID.fromString(workspaceId));
        createTpl.setName("Tech Applications Template");
        createTpl.setDescription("Custom fields for recruiter contacts and hiring tiers");
        createTpl.setRecordType(TemplateRecordType.JOB_APPLICATION);

        MvcResult tplRes = mockMvc.perform(post("/api/v1/templates")
                        .session(aliceSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createTpl)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Tech Applications Template"))
                .andExpect(jsonPath("$.data.versions", hasSize(1)))
                .andExpect(jsonPath("$.data.versions[0].versionNumber").value(1))
                .andExpect(jsonPath("$.data.versions[0].status").value("DRAFT"))
                .andReturn();

        JsonNode tplNode = objectMapper.readTree(tplRes.getResponse().getContentAsString()).get("data");
        String templateId = tplNode.get("id").asText();
        String version1Id = tplNode.get("versions").get(0).get("id").asText();

        // 3. Alice adds field definitions to draft Version 1
        // Field 1: recruiter_email (EMAIL, required)
        CreateFieldDefinitionRequest emailField = new CreateFieldDefinitionRequest();
        emailField.setFieldKey("recruiter_email");
        emailField.setLabel("Recruiter Email");
        emailField.setFieldType(FieldType.EMAIL);
        emailField.setRequired(true);

        mockMvc.perform(post("/api/v1/templates/versions/" + version1Id + "/fields")
                        .session(aliceSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emailField)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.fieldKey").value("recruiter_email"));

        // Field 2: referral_bonus (NUMBER, min=0, max=50000, optional)
        CreateFieldDefinitionRequest numberField = new CreateFieldDefinitionRequest();
        numberField.setFieldKey("referral_bonus");
        numberField.setLabel("Referral Bonus ($)");
        numberField.setFieldType(FieldType.NUMBER);
        numberField.setConfig("{\"min\": 0, \"max\": 50000}");
        numberField.setRequired(false);

        mockMvc.perform(post("/api/v1/templates/versions/" + version1Id + "/fields")
                        .session(aliceSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(numberField)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.fieldKey").value("referral_bonus"));

        // Field 3: company_tier (SINGLE_SELECT, options: ["Tier 1 FAANG", "Tier 2 Unicorn", "Seed Startup"])
        CreateFieldDefinitionRequest tierField = new CreateFieldDefinitionRequest();
        tierField.setFieldKey("company_tier");
        tierField.setLabel("Company Tier");
        tierField.setFieldType(FieldType.SINGLE_SELECT);
        tierField.setConfig("{\"options\": [\"Tier 1 FAANG\", \"Tier 2 Unicorn\", \"Seed Startup\"]}");
        tierField.setRequired(true);

        mockMvc.perform(post("/api/v1/templates/versions/" + version1Id + "/fields")
                        .session(aliceSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tierField)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.fieldKey").value("company_tier"));

        // 4. Alice publishes Version 1
        mockMvc.perform(post("/api/v1/templates/" + templateId + "/versions/" + version1Id + "/publish")
                        .session(aliceSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PUBLISHED"))
                .andExpect(jsonPath("$.data.publishedAt").isNotEmpty());

        // 5. Immutability check: Attempting to add a field to published Version 1 must fail
        CreateFieldDefinitionRequest illegalField = new CreateFieldDefinitionRequest();
        illegalField.setFieldKey("retroactive_field");
        illegalField.setLabel("Retroactive Field");
        illegalField.setFieldType(FieldType.TEXT);

        mockMvc.perform(post("/api/v1/templates/versions/" + version1Id + "/fields")
                        .session(aliceSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(illegalField)))
                .andExpect(status().isBadRequest());

        // 6. Branching: Alice creates Version 2 from template
        MvcResult v2Result = mockMvc.perform(post("/api/v1/templates/" + templateId + "/versions")
                        .session(aliceSession))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.versionNumber").value(2))
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.data.fieldDefinitions", hasSize(3))) // Inherited from v1!
                .andReturn();

        // 7. Test Server-Side Validation on Job Applications with Version 1
        // Test 7a: Missing required field ('recruiter_email') -> must fail
        CreateApplicationRequest invalidReq1 = new CreateApplicationRequest();
        invalidReq1.setWorkspaceId(UUID.fromString(workspaceId));
        invalidReq1.setCompanyName("Google");
        invalidReq1.setJobTitle("Staff Software Engineer");
        invalidReq1.setTemplateVersionId(UUID.fromString(version1Id));
        Map<String, Object> invalidFields1 = new HashMap<>();
        invalidFields1.put("company_tier", "Tier 1 FAANG");
        // omitted recruiter_email
        invalidReq1.setCustomFields(invalidFields1);

        mockMvc.perform(post("/api/v1/applications")
                        .session(aliceSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidReq1)))
                .andExpect(status().isBadRequest());

        // Test 7b: Invalid Single Select Option -> must fail
        CreateApplicationRequest invalidReq2 = new CreateApplicationRequest();
        invalidReq2.setWorkspaceId(UUID.fromString(workspaceId));
        invalidReq2.setCompanyName("Google");
        invalidReq2.setJobTitle("Staff Software Engineer");
        invalidReq2.setTemplateVersionId(UUID.fromString(version1Id));
        Map<String, Object> invalidFields2 = new HashMap<>();
        invalidFields2.put("recruiter_email", "recruiter@google.com");
        invalidFields2.put("company_tier", "Invalid Nonexistent Tier");
        invalidReq2.setCustomFields(invalidFields2);

        mockMvc.perform(post("/api/v1/applications")
                        .session(aliceSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidReq2)))
                .andExpect(status().isBadRequest());

        // Test 7c: Number out of bounds (referral_bonus > 50000) -> must fail
        CreateApplicationRequest invalidReq3 = new CreateApplicationRequest();
        invalidReq3.setWorkspaceId(UUID.fromString(workspaceId));
        invalidReq3.setCompanyName("Google");
        invalidReq3.setJobTitle("Staff Software Engineer");
        invalidReq3.setTemplateVersionId(UUID.fromString(version1Id));
        Map<String, Object> invalidFields3 = new HashMap<>();
        invalidFields3.put("recruiter_email", "recruiter@google.com");
        invalidFields3.put("company_tier", "Tier 1 FAANG");
        invalidFields3.put("referral_bonus", 999999);
        invalidReq3.setCustomFields(invalidFields3);

        mockMvc.perform(post("/api/v1/applications")
                        .session(aliceSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidReq3)))
                .andExpect(status().isBadRequest());

        // Test 7d: Valid Custom Fields -> SUCCESS
        CreateApplicationRequest validAppReq = new CreateApplicationRequest();
        validAppReq.setWorkspaceId(UUID.fromString(workspaceId));
        validAppReq.setCompanyName("Google");
        validAppReq.setJobTitle("Staff Software Engineer");
        validAppReq.setTemplateVersionId(UUID.fromString(version1Id));
        Map<String, Object> validFields = new HashMap<>();
        validFields.put("recruiter_email", "sundar.recruiting@google.com");
        validFields.put("company_tier", "Tier 1 FAANG");
        validFields.put("referral_bonus", 15000);
        validAppReq.setCustomFields(validFields);

        MvcResult appResult = mockMvc.perform(post("/api/v1/applications")
                        .session(aliceSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validAppReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.companyName").value("Google"))
                .andExpect(jsonPath("$.data.templateVersionId").value(version1Id))
                .andExpect(jsonPath("$.data.templateName").value("Tech Applications Template"))
                .andExpect(jsonPath("$.data.customFields.recruiter_email").value("sundar.recruiting@google.com"))
                .andExpect(jsonPath("$.data.customFields.company_tier").value("Tier 1 FAANG"))
                .andExpect(jsonPath("$.data.customFields.referral_bonus").value(15000))
                .andReturn();

        String appId = objectMapper.readTree(appResult.getResponse().getContentAsString()).get("data").get("id").asText();

        // 8. Verify Application Detail contains customFields and fieldDefinitions
        mockMvc.perform(get("/api/v1/applications/" + appId)
                        .session(aliceSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.customFields.recruiter_email").value("sundar.recruiting@google.com"))
                .andExpect(jsonPath("$.data.fieldDefinitions", hasSize(3)));

        // 9. Generic Custom Record CRUD (`/api/v1/records`)
        CreateCustomRecordRequest customRecordReq = new CreateCustomRecordRequest();
        customRecordReq.setWorkspaceId(UUID.fromString(workspaceId));
        customRecordReq.setTemplateVersionId(UUID.fromString(version1Id));
        customRecordReq.setTitle("Google Interview Prep Sheet");
        Map<String, Object> crFields = new HashMap<>();
        crFields.put("recruiter_email", "recruiting-team@google.com");
        crFields.put("company_tier", "Tier 1 FAANG");
        crFields.put("referral_bonus", 5000);
        customRecordReq.setFieldValues(crFields);

        MvcResult crResult = mockMvc.perform(post("/api/v1/records")
                        .session(aliceSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(customRecordReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title").value("Google Interview Prep Sheet"))
                .andExpect(jsonPath("$.data.fieldValues.recruiter_email").value("recruiting-team@google.com"))
                .andReturn();

        String recordId = objectMapper.readTree(crResult.getResponse().getContentAsString()).get("data").get("id").asText();

        // 10. Multi-Tenancy Isolation: Register Bob and attempt cross-tenant access
        RegisterRequest bobReq = new RegisterRequest(
                "bob_attacker@lifestack.dev",
                "Password123!",
                "Bob Attacker",
                "UTC"
        );
        MvcResult regBob = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bobReq)))
                .andExpect(status().isCreated())
                .andReturn();
        MockHttpSession bobSession = (MockHttpSession) regBob.getRequest().getSession(false);

        // Bob tries to access Alice's template -> 404
        mockMvc.perform(get("/api/v1/templates/" + templateId)
                        .session(bobSession))
                .andExpect(status().isNotFound());

        // Bob tries to access Alice's custom record -> 404
        mockMvc.perform(get("/api/v1/records/" + recordId)
                        .session(bobSession))
                .andExpect(status().isNotFound());
    }
}
