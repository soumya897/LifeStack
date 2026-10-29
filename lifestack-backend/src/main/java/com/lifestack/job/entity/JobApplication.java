package com.lifestack.job.entity;

import com.lifestack.note.entity.Note;
import com.lifestack.user.entity.User;
import com.lifestack.workspace.entity.Workspace;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "applications")
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "company_name", nullable = false, length = 200)
    private String companyName;

    @Column(name = "job_title", nullable = false, length = 200)
    private String jobTitle;

    @Column(length = 100)
    private String source;

    @Column(name = "job_url", columnDefinition = "TEXT")
    private String jobUrl;

    @Column(name = "applied_at")
    private LocalDate appliedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    @Column(length = 150)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_mode", length = 50)
    private WorkMode workMode = WorkMode.REMOTE;

    @Column(length = 100)
    private String salary;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "follow_up_at")
    private LocalDate followUpAt;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("scheduledAt ASC")
    private List<InterviewEvent> interviews = new ArrayList<>();

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt DESC")
    private List<ApplicationHistory> history = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "application_notes",
            joinColumns = { @JoinColumn(name = "application_id") },
            inverseJoinColumns = { @JoinColumn(name = "note_id") }
    )
    private Set<Note> attachedNotes = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public JobApplication() {
    }

    public JobApplication(Workspace workspace, User owner, String companyName, String jobTitle,
                          String source, String jobUrl, LocalDate appliedAt, ApplicationStatus status,
                          String location, WorkMode workMode, String salary, String notes, LocalDate followUpAt) {
        this.workspace = workspace;
        this.owner = owner;
        this.companyName = companyName;
        this.jobTitle = jobTitle;
        this.source = source;
        this.jobUrl = jobUrl;
        this.appliedAt = appliedAt != null ? appliedAt : LocalDate.now();
        this.status = status != null ? status : ApplicationStatus.APPLIED;
        this.location = location;
        this.workMode = workMode != null ? workMode : WorkMode.REMOTE;
        this.salary = salary;
        this.notes = notes;
        this.followUpAt = followUpAt;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Workspace getWorkspace() {
        return workspace;
    }

    public void setWorkspace(Workspace workspace) {
        this.workspace = workspace;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getJobUrl() {
        return jobUrl;
    }

    public void setJobUrl(String jobUrl) {
        this.jobUrl = jobUrl;
    }

    public LocalDate getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(LocalDate appliedAt) {
        this.appliedAt = appliedAt;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public WorkMode getWorkMode() {
        return workMode;
    }

    public void setWorkMode(WorkMode workMode) {
        this.workMode = workMode;
    }

    public String getSalary() {
        return salary;
    }

    public void setSalary(String salary) {
        this.salary = salary;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDate getFollowUpAt() {
        return followUpAt;
    }

    public void setFollowUpAt(LocalDate followUpAt) {
        this.followUpAt = followUpAt;
    }

    public List<InterviewEvent> getInterviews() {
        return interviews;
    }

    public void setInterviews(List<InterviewEvent> interviews) {
        this.interviews = interviews;
    }

    public List<ApplicationHistory> getHistory() {
        return history;
    }

    public void setHistory(List<ApplicationHistory> history) {
        this.history = history;
    }

    public Set<Note> getAttachedNotes() {
        return attachedNotes;
    }

    public void setAttachedNotes(Set<Note> attachedNotes) {
        this.attachedNotes = attachedNotes;
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
}

