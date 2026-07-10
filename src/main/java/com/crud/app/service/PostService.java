package com.crud.app.service;

import com.crud.app.dto.request.PostReqDTO;
import com.crud.app.entity.Post;
import com.crud.app.entity.User;
import com.crud.app.repository.FollowRepository;
import com.crud.app.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepo;
    private final UserService userService;
    private final FollowRepository followRepo;

    public List<Post> getAll() {
        return postRepo.findAll();
    }

    public Post get(Long id) {
        Post post = postRepo.findById(id).orElse(null);
        if (post == null) {
            throw new RuntimeException("Post with id " + id + " not found");
        }
        return post;
    }

    public Post create(PostReqDTO dto) {
        User user = userService.get(dto.getUserId());

        Post post = Post.builder()
                .imageUrl(dto.getImageUrl())
                .description(dto.getDescription())
                .count(dto.getCount() != null ? dto.getCount() : 0)
                .user(user)
                .build();

        return postRepo.save(post);
    }

    public Post update(Long id, PostReqDTO dto) {
        Post existing = get(id);

        if (dto.getImageUrl() != null) {
            existing.setImageUrl(dto.getImageUrl());
        }
        if (dto.getDescription() != null) {
            existing.setDescription(dto.getDescription());
        }
        if (dto.getCount() != null) {
            existing.setCount(dto.getCount());
        }
        if (dto.getUserId() != null) {
            User newUser = userService.get(dto.getUserId());
            existing.setUser(newUser);
        }

        return postRepo.save(existing);
    }

    public void delete(Long id) {
        Post post = get(id);
        postRepo.delete(post);
    }

    public List<Post> getPostsByUser(Long userId) {
        // Verify user exists first
        userService.get(userId);

        // Filter using streams
        return postRepo.findAll().stream()
                .filter(p -> p.getUser().getId().equals(userId))
                .toList();
    }

    public List<Post> getFeed(Long userId) {
        // Get list of followed user IDs using streams
        List<Long> followedUserIds = followRepo.findAll().stream()
                .filter(f -> f.getFollower().getId().equals(userId))
                .map(f -> f.getFollowing().getId())
                .toList();

        // Filter all posts using streams to find posts where publisher is in followed lists
        return postRepo.findAll().stream()
                .filter(p -> followedUserIds.contains(p.getUser().getId()))
                .toList();
    }
}
