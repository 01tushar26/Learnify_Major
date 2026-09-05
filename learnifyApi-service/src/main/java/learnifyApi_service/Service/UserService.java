package learnifyApi_service.Service;

import learnifyApi_service.Entities.User;

public interface UserService {

        User getUserById(Long id);
        User getOrCreateFromOAuth(String email, String name, String provider, String providerId);
    }

