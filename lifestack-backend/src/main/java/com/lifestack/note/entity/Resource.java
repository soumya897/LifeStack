package com.lifestack.note.entity;

import com.lifestack.learning.entity.Topic;
import com.lifestack.user.entity.User;
import com.lifestack.workspace.entity.Workspace;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "resource_type", nullable = false, length = 50)
    private String resourceType = "ARTICLE";

    @Column(nullable = false, columnDefinition = "TEXT")
    private String url;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "topic_resources",
            joinColumns = { @JoinColumn(name = "resource_id") },
            inverseJoinColumns = { @JoinColumn(name = "topic_id") }
    )
    private Set<Topic> topics = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public Resource() {
    }

    public Resource(Workspace workspace, User owner, String name, String resourceType, String url) {
        this.workspace = workspace;
        this.owner = owner;
        this.name = name;
        this.resourceType = resourceType != null ? resourceType : "ARTICLE";
        this.url = url;
    }

    @PrePersist
    protected void onCreate() {
        if (this.resourceType == null) {
            this.resourceType = "ARTICLE";
        }
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Set<Topic> getTopics() {
        return topics;
    }

    public void setTopics(Set<Topic> topics) {
        this.topics = topics;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
