package com.lifestack.user.repository;

import com.lifestack.user.entity.UserDailyActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface UserDailyActivityRepository extends JpaRepository<UserDailyActivity, UUID> {

    boolean existsByUserIdAndActivityDate(UUID userId, LocalDate date);

    @Query("SELECT COUNT(DISTINCT a.user.id) FROM UserDailyActivity a WHERE a.activityDate = :date")
    long countDistinctUsersByDate(@Param("date") LocalDate date);

    @Query("SELECT a.activityDate, COUNT(DISTINCT a.user.id) " +
           "FROM UserDailyActivity a " +
           "WHERE a.activityDate >= :sinceDate " +
           "GROUP BY a.activityDate " +
           "ORDER BY a.activityDate ASC")
    List<Object[]> countDailyActiveUsersSince(@Param("sinceDate") LocalDate sinceDate);
}

