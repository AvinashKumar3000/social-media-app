package com.crud.app.service;

import com.crud.app.entity.User;
import com.crud.app.repository.UserRepository;
import com.crud.app.repository.FollowRepository;
import com.crud.app.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepo;
    private final FollowRepository followRepo;
    private final PostRepository postRepo;

    public List<User> getAll() {
        return userRepo.findAll();
    }

    public User get(Long id) {
        User user = userRepo.findById(id).orElse(null);
        if (user == null) {
            throw new RuntimeException("User with id " + id + " not found");
        }
        return user;
    }

    public User create(User newUser) {
        // Use stream to check if email already exists
        boolean emailExists = userRepo.findAll().stream()
                .anyMatch(u -> u.getEmail().equalsIgnoreCase(newUser.getEmail()));
        if (emailExists) {
            throw new RuntimeException("Email already registered");
        }
        return userRepo.save(newUser);
    }

    public void delete(Long id) {
        // Verify user exists first
        User user = get(id);

        // Cascade delete follows involving this user using streams
        followRepo.findAll().stream()
                .filter(f -> f.getFollower().getId().equals(id) || f.getFollowing().getId().equals(id))
                .forEach(followRepo::delete);

        // Cascade delete posts created by this user using streams
        postRepo.findAll().stream()
                .filter(p -> p.getUser().getId().equals(id))
                .forEach(postRepo::delete);

        userRepo.delete(user);
    }

    public User update(Long id, User updateDetails) {
        User existing = get(id);
        if (updateDetails.getName() != null) {
            existing.setName(updateDetails.getName());
        }
        if (updateDetails.getProfilePic() != null) {
            existing.setProfilePic(updateDetails.getProfilePic());
        }
        if (updateDetails.getBio() != null) {
            existing.setBio(updateDetails.getBio());
        }
        if (updateDetails.getIsPrivate() != null) {
            existing.setIsPrivate(updateDetails.getIsPrivate());
        }
        if (updateDetails.getPassword() != null && !updateDetails.getPassword().isEmpty()) {
            existing.setPassword(updateDetails.getPassword());
        }
        return userRepo.save(existing);
    }

    public User login(String email, String password) {
        User user = userRepo.findAll().stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(email))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // Direct plaintext comparison since pass hashing is not needed for now
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Invalid email or password");
        }
        return user;
    }
}
