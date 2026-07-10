package com.crud.app.controller;

import com.crud.app.dto.request.PostReqDTO;
import com.crud.app.dto.response.ApiResponse;
import com.crud.app.entity.Post;
import com.crud.app.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/posts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PostController {
    private final PostService postService;

    @GetMapping
    public ApiResponse<List<Post>> getAll() {
        try {
            List<Post> posts = postService.getAll();
            return ApiResponse.success("Fetched all posts successfully", posts);
        } catch (Exception e) {
            return ApiResponse.failure(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ApiResponse<Post> getById(@PathVariable Long id) {
        try {
            Post post = postService.get(id);
            return ApiResponse.success("Fetched post successfully", post);
        } catch (Exception e) {
            return ApiResponse.failure(e.getMessage());
        }
    }

    @PostMapping
    public ApiResponse<Post> create(@Validated @RequestBody PostReqDTO payload) {
        try {
            Post created = postService.create(payload);
            return ApiResponse.success("Created post successfully", created);
        } catch (Exception e) {
            return ApiResponse.failure(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ApiResponse<Post> update(@PathVariable Long id, @RequestBody PostReqDTO payload) {
        try {
            Post updated = postService.update(id, payload);
            return ApiResponse.success("Updated post successfully", updated);
        } catch (Exception e) {
            return ApiResponse.failure(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Object> delete(@PathVariable Long id) {
        try {
            postService.delete(id);
            return ApiResponse.success("Deleted post successfully", null);
        } catch (Exception e) {
            return ApiResponse.failure(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<Post>> getByUserId(@PathVariable Long userId) {
        try {
            List<Post> posts = postService.getPostsByUser(userId);
            return ApiResponse.success("Fetched user posts successfully", posts);
        } catch (Exception e) {
            return ApiResponse.failure(e.getMessage());
        }
    }

    @GetMapping("/feed/{userId}")
    public ApiResponse<List<Post>> getFeedByUserId(@PathVariable Long userId) {
        try {
            List<Post> feed = postService.getFeed(userId);
            return ApiResponse.success("Fetched feed successfully", feed);
        } catch (Exception e) {
            return ApiResponse.failure(e.getMessage());
        }
    }
}
