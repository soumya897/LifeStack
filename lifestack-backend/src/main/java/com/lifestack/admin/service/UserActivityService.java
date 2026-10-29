package com.lifestack.admin.service;

import com.lifestack.admin.dto.DailyDauPoint;
import com.lifestack.admin.dto.DauMetricsResponse;
import com.lifestack.user.entity.User;
import com.lifestack.user.entity.UserDailyActivity;
import com.lifestack.user.repository.UserDailyActivityRepository;
import com.lifestack.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserActivityService {

    private static final Logger log = LoggerFactory.getLogger(UserActivityService.class);

    private final UserDailyActivityRepository dailyActivityRepository;
    private final UserRepository userRepository;

    private final Map<UUID, LocalDate> lastRecordedDate = new ConcurrentHashMap<>();
    private final Map<UUID, Instant> lastActivityTimestamp = new ConcurrentHashMap<>();

    public UserActivityService(UserDailyActivityRepository dailyActivityRepository,
                               UserRepository userRepository) {
        this.dailyActivityRepository = dailyActivityRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void recordActivity(UUID userId) {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate lastDate = lastRecordedDate.get(userId);

        if (!today.equals(lastDate)) {
            try {
                if (!dailyActivityRepository.existsByUserIdAndActivityDate(userId, today)) {
                    Optional<User> userOpt = userRepository.findById(userId);
                    if (userOpt.isPresent()) {
                        User user = userOpt.get();
                        dailyActivityRepository.save(new UserDailyActivity(user, today));
                        user.setLastActiveAt(Instant.now());
                        userRepository.save(user);
                    }
                }
                lastRecordedDate.put(userId, today);
                lastActivityTimestamp.put(userId, Instant.now());
            } catch (Exception e) {
                log.debug("Concurrent daily activity insert handled: {}", e.getMessage());
            }
        } else {
            Instant lastTs = lastActivityTimestamp.get(userId);
            Instant now = Instant.now();
            if (lastTs == null || now.isAfter(lastTs.plusSeconds(300))) {
                userRepository.findById(userId).ifPresent(user -> {
                    user.setLastActiveAt(now);
                    userRepository.save(user);
                });
                lastActivityTimestamp.put(userId, now);
            }
        }
    }

    @Transactional(readOnly = true)
    public DauMetricsResponse getDauMetrics() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate thirtyDaysAgo = today.minusDays(29);
        LocalDate sevenDaysAgo = today.minusDays(6);

        List<Object[]> rawCounts = dailyActivityRepository.countDailyActiveUsersSince(thirtyDaysAgo);
        Map<LocalDate, Long> countsByDate = new HashMap<>();
        for (Object[] row : rawCounts) {
            LocalDate date = (LocalDate) row[0];
            Long count = ((Number) row[1]).longValue();
            countsByDate.put(date, count);
        }

        List<DailyDauPoint> points = new ArrayList<>();
        long sevenDaySum = 0;
        int sevenDayDays = 0;
        long thirtyDaySum = 0;
        int thirtyDayDays = 0;

        for (int i = 0; i < 30; i++) {
            LocalDate date = thirtyDaysAgo.plusDays(i);
            long count = countsByDate.getOrDefault(date, 0L);
            points.add(new DailyDauPoint(date.toString(), count));

            thirtyDaySum += count;
            thirtyDayDays++;

            if (!date.isBefore(sevenDaysAgo)) {
                sevenDaySum += count;
                sevenDayDays++;
            }
        }

        double sevenDayAverage = sevenDayDays > 0 ? (double) sevenDaySum / sevenDayDays : 0.0;
        double thirtyDayAverage = thirtyDayDays > 0 ? (double) thirtyDaySum / thirtyDayDays : 0.0;
        long todayDau = countsByDate.getOrDefault(today, 0L);

        return new DauMetricsResponse(
                todayDau,
                Math.round(sevenDayAverage * 10.0) / 10.0,
                Math.round(thirtyDayAverage * 10.0) / 10.0,
                points
        );
    }
}

