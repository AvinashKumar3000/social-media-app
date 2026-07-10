package com.crud.app.service;

import com.crud.app.entity.Follow;
import com.crud.app.entity.User;
import com.crud.app.repository.FollowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FollowService {
    private final FollowRepository followRepo;
    private final UserService userService;

    public void follow(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw new RuntimeException("Users cannot follow themselves");
        }

        // Verify users exist
        User follower = userService.get(followerId);
        User following = userService.get(followingId);

        // Check if follow relation already exists
        boolean alreadyFollowing = followRepo.findAll().stream()
                .anyMatch(f -> f.getFollower().getId().equals(followerId) && f.getFollowing().getId().equals(followingId));

        if (alreadyFollowing) {
            throw new RuntimeException("Already following this user");
        }

        Follow followObj = Follow.builder()
                .follower(follower)
                .following(following)
                .build();
        followRepo.save(followObj);
    }

    public void unfollow(Long followerId, Long followingId) {
        // Verify users exist
        userService.get(followerId);
        userService.get(followingId);

        // Find follow relation
        Follow followObj = followRepo.findAll().stream()
                .filter(f -> f.getFollower().getId().equals(followerId) && f.getFollowing().getId().equals(followingId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Follow relationship not found"));

        followRepo.delete(followObj);
    }

    public List<User> getFollowers(Long userId) {
        // Verify user exists first
        userService.get(userId);

        // Map and extract follower users
        return followRepo.findAll().stream()
                .filter(f -> f.getFollowing().getId().equals(userId))
                .map(Follow::getFollower)
                .toList();
    }

    public List<User> getFollowing(Long userId) {
        // Verify user exists first
        userService.get(userId);

        // Map and extract following users
        return followRepo.findAll().stream()
                .filter(f -> f.getFollower().getId().equals(userId))
                .map(Follow::getFollowing)
                .toList();
    }
}
