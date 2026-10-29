package com.lifestack.coding.entity;

import com.lifestack.learning.entity.Topic;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "problems")
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String statement;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ProblemDifficulty difficulty = ProblemDifficulty.MEDIUM;

    @Column(name = "platform_url", columnDefinition = "TEXT")
    private String platformUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ProblemStatus status = ProblemStatus.UNSOLVED;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProblemSolution> solutions = new ArrayList<>();

    public Problem() {
    }

    public Problem(Topic topic, String title, String statement, ProblemDifficulty difficulty, String platformUrl) {
        this.topic = topic;
        this.title = title;
        this.statement = statement;
        this.difficulty = difficulty != null ? difficulty : ProblemDifficulty.MEDIUM;
        this.platformUrl = platformUrl;
        this.status = ProblemStatus.UNSOLVED;
    }

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) {
            this.status = ProblemStatus.UNSOLVED;
        }
        if (this.difficulty == null) {
            this.difficulty = ProblemDifficulty.MEDIUM;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Topic getTopic() {
        return topic;
    }

    public void setTopic(Topic topic) {
        this.topic = topic;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getStatement() {
        return statement;
    }

    public void setStatement(String statement) {
        this.statement = statement;
    }

    public ProblemDifficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(ProblemDifficulty difficulty) {
        this.difficulty = difficulty;
    }

    public String getPlatformUrl() {
        return platformUrl;
    }

    public void setPlatformUrl(String platformUrl) {
        this.platformUrl = platformUrl;
    }

    public ProblemStatus getStatus() {
        return status;
    }

    public void setStatus(ProblemStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<ProblemSolution> getSolutions() {
        return solutions;
    }

    public void setSolutions(List<ProblemSolution> solutions) {
        this.solutions = solutions;
    }

    public void addSolution(ProblemSolution solution) {
        this.solutions.add(solution);
        solution.setProblem(this);
    }

    public void removeSolution(ProblemSolution solution) {
        this.solutions.remove(solution);
        solution.setProblem(null);
    }
}
