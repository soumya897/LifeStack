package com.lifestack.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifestack.user.dto.LoginRequest;
import com.lifestack.user.dto.RegisterRequest;
import jakarta.servlet.http.Cookie;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Should successfully register a new user and establish authenticated session")
    void shouldRegisterAndEstablishSession() throws Exception {
        RegisterRequest registerReq = new RegisterRequest(
                "student1@lifestack.dev",
                "Password123!",
                "Alex Developer",
                "Asia/Kolkata"
        );

        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("student1@lifestack.dev"))
                .andExpect(jsonPath("$.data.displayName").value("Alex Developer"))
                .andExpect(jsonPath("$.data.timezone").value("Asia/Kolkata"))
                .andReturn();

        MockHttpSession session = (MockHttpSession) result.getRequest().getSession(false);

        // Access protected /users/me using the active session
        mockMvc.perform(get("/api/v1/users/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("student1@lifestack.dev"));
    }

    @Test
    @DisplayName("Should reject duplicate registration with 409 Conflict")
    void shouldRejectDuplicateRegistration() throws Exception {
        RegisterRequest registerReq = new RegisterRequest(
                "duplicate@lifestack.dev",
                "Password123!",
                "First User",
                "UTC"
        );

        // First registration
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        // Duplicate registration
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Should authenticate valid login credentials and reject bad credentials")
    void shouldAuthenticateValidLoginAndRejectBad() throws Exception {
        RegisterRequest registerReq = new RegisterRequest(
                "loginuser@lifestack.dev",
                "SecurePassword123!",
                "Login User",
                "UTC"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        // Bad password
        LoginRequest badLogin = new LoginRequest("loginuser@lifestack.dev", "WrongPassword");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badLogin)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));

        // Correct password
        LoginRequest validLogin = new LoginRequest("loginuser@lifestack.dev", "SecurePassword123!");
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("loginuser@lifestack.dev"))
                .andReturn();

        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession(false);

        // Verify protected endpoint with session
        mockMvc.perform(get("/api/v1/users/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("loginuser@lifestack.dev"));

        // Logout
        mockMvc.perform(post("/api/v1/auth/logout").session(session))
                .andExpect(status().isOk());

        // Subsequent access should fail with 401
        mockMvc.perform(get("/api/v1/users/me").session(session))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should block unauthenticated requests to protected endpoints with 401")
    void shouldBlockUnauthenticatedRequests() throws Exception {
        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));

        mockMvc.perform(get("/api/v1/workspaces"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }
}

