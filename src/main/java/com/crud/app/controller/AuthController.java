package com.crud.app.controller;

import com.crud.app.dto.request.LoginReqDTO;
import com.crud.app.dto.request.RegisterReqDTO;
import com.crud.app.dto.response.ApiResponse;
import com.crud.app.entity.User;
import com.crud.app.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    private final UserService userService;

    @PostMapping("/login")
    public ApiResponse<Object> login(@Validated @RequestBody LoginReqDTO payload) {
        try {
            User user = userService.login(payload.getEmail(), payload.getPassword());
            return ApiResponse.success("Login successful", user);
        } catch (Exception e) {
            return ApiResponse.failure(e.getMessage());
        }
    }

    @PostMapping("/register")
    public ApiResponse<Object> register(@Validated @RequestBody RegisterReqDTO payload) {
        try {
            User newUser = User.builder()
                    .name(payload.getName())
                    .email(payload.getEmail())
                    .password(payload.getPassword())
                    .isPrivate(true)
                    .bio("")
                    .profilePic("")
                    .build();
            User registered = userService.create(newUser);
            return ApiResponse.success("Registration successful", registered);
        } catch (Exception e) {
            return ApiResponse.failure(e.getMessage());
        }
    }
}
