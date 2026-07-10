package com.crud.app.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostReqDTO {
    @NotNull(message = "Image URL is required")
    private String imageUrl;

    private String description;

    private Integer count;

    @NotNull(message = "User ID (Author) is required")
    private Long userId;
}
