package com.kredia.dto.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kredia.entity.user.UserRole;
import com.kredia.entity.user.UserStatus;
import com.kredia.entity.user.Gender;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Enhanced client DTO for agent view - includes calculated metrics like priority score
 * and last interaction timestamp
 */
public class EnhancedClientDTO {

    @JsonProperty("userId")
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private UserStatus status;
    private UserRole role;
    private Instant createdAt;
    private Instant updatedAt;
    private Long assignedAgentId;
    private String assignedAgentName;
    private LocalDate dateOfBirth;
    private String address;
    private Gender gender;
    
    // Enhanced fields for agent view
    private Instant lastInteraction;
    private Integer priorityScore;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public Long getAssignedAgentId() { return assignedAgentId; }
    public void setAssignedAgentId(Long assignedAgentId) { this.assignedAgentId = assignedAgentId; }

    public String getAssignedAgentName() { return assignedAgentName; }
    public void setAssignedAgentName(String assignedAgentName) { this.assignedAgentName = assignedAgentName; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Gender getGender() { return gender; }
    public void setGender(Gender gender) { this.gender = gender; }

    public Instant getLastInteraction() { return lastInteraction; }
    public void setLastInteraction(Instant lastInteraction) { this.lastInteraction = lastInteraction; }

    public Integer getPriorityScore() { return priorityScore; }
    public void setPriorityScore(Integer priorityScore) { this.priorityScore = priorityScore; }
}
