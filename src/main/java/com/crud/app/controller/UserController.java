package com.crud.app.controller;

import com.crud.app.dto.response.ApiResponse;
import com.crud.app.entity.User;
import com.crud.app.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {
    private final UserService userService;

    @GetMapping
    public ApiResponse<List<User>> getAll() {
        try {
            List<User> users = userService.getAll();
            return ApiResponse.success("Fetched all users successfully", users);
        } catch (Exception e) {
            return ApiResponse.failure(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ApiResponse<User> getById(@PathVariable Long id) {
        try {
            User user = userService.get(id);
            return ApiResponse.success("Fetched user successfully", user);
        } catch (Exception e) {
            return ApiResponse.failure(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ApiResponse<User> update(@PathVariable Long id, @RequestBody User request) {
        try {
            User updated = userService.update(id, request);
            return ApiResponse.success("Updated user successfully", updated);
        } catch (Exception e) {
            return ApiResponse.failure(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> delete(@PathVariable Long id) {
        try {
            userService.delete(id);
            return ApiResponse.success("Deleted user successfully", null);
        } catch (Exception e) {
            return ApiResponse.failure(e.getMessage());
        }
    }
}
