package com.lifestack.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifestack.admin.service.UserActivityService;
import com.lifestack.common.response.ApiResponse;
import com.lifestack.user.entity.User;
import com.lifestack.user.entity.UserStatus;
import com.lifestack.user.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

/**
 * Filter ensuring that blocked users are immediately blocked with 403 Forbidden ("Account is suspended")
 * and that active user activity is recorded for DAU metrics.
 */
@Component
public class UserStatusFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;
    private final UserActivityService userActivityService;
    private final ObjectMapper objectMapper;

    public UserStatusFilter(UserRepository userRepository,
                            UserActivityService userActivityService,
                            ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.userActivityService = userActivityService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof SecurityUser) {
            SecurityUser securityUser = (SecurityUser) auth.getPrincipal();
            UUID userId = securityUser.getId();
            Optional<User> optionalUser = userRepository.findById(userId);

            if (optionalUser.isEmpty() || optionalUser.get().getStatus() == UserStatus.BLOCKED) {
                // Immediate session revocation
                HttpSession session = request.getSession(false);
                if (session != null) {
                    session.invalidate();
                }
                SecurityContextHolder.clearContext();

                response.setStatus(HttpStatus.FORBIDDEN.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                ApiResponse<Void> errorResponse = ApiResponse.error("Account is suspended");
                response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
                return;
            }

            // Record user daily activity
            userActivityService.recordActivity(userId);
        }

        filterChain.doFilter(request, response);
    }
}

