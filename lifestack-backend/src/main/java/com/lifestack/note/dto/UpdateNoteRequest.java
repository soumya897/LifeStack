package com.lifestack.note.dto;

import jakarta.validation.constraints.Size;

public class UpdateNoteRequest {

    @Size(max = 200, message = "Note title must not exceed 200 characters")
    private String title;

    private String content;

    private String tags;

    public UpdateNoteRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }
}
