package com.crud.app.controller;

import com.crud.app.dto.response.ApiResponse;
import com.crud.app.entity.User;
import com.crud.app.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/follows")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FollowController {
    private final FollowService followService;

    @PostMapping("/follow")
    public ApiResponse<Object> follow(@RequestParam Long followerId, @RequestParam Long followingId) {
        try {
            followService.follow(followerId, followingId);
            return ApiResponse.success("Successfully followed user", null);
        } catch (Exception e) {
            return ApiResponse.failure(e.getMessage());
        }
    }

    @PostMapping("/unfollow")
    public ApiResponse<Object> unfollow(@RequestParam Long followerId, @RequestParam Long followingId) {
        try {
            followService.unfollow(followerId, followingId);
            return ApiResponse.success("Successfully unfollowed user", null);
        } catch (Exception e) {
            return ApiResponse.failure(e.getMessage());
        }
    }

    @GetMapping("/followers/{userId}")
    public ApiResponse<List<User>> getFollowers(@PathVariable Long userId) {
        try {
            List<User> followers = followService.getFollowers(userId);
            return ApiResponse.success("Fetched followers list successfully", followers);
        } catch (Exception e) {
            return ApiResponse.failure(e.getMessage());
        }
    }

    @GetMapping("/following/{userId}")
    public ApiResponse<List<User>> getFollowing(@PathVariable Long userId) {
        try {
            List<User> following = followService.getFollowing(userId);
            return ApiResponse.success("Fetched following list successfully", following);
        } catch (Exception e) {
            return ApiResponse.failure(e.getMessage());
        }
    }
}
