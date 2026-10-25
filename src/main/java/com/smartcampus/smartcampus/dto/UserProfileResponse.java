package com.smartcampus.smartcampus.dto;

public record UserProfileResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String role
) {}