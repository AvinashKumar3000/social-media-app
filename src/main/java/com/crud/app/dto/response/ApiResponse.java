package com.crud.app.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private Boolean success;
    private String message;
    private T data;

    public static <T> ApiResponse<T> success(String msg, T data) {
        ApiResponse<T> obj = ApiResponse.<T>builder()
                .success(true)
                .message(msg)
                .data(data)
                .build();
        return obj;
    }
    public static <T> ApiResponse<T> failure(String msg) {
        ApiResponse<T> obj = ApiResponse.<T>builder()
                .success(false)
                .message(msg)
                .data(null)
                .build();
        return obj;
    }
}
