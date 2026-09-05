package learnifyApi_service.Service;

import learnifyApi_service.Entities.User;
import learnifyApi_service.Exceptions.ResourceNotFoundException;
import learnifyApi_service.Repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(()->new ResourceNotFoundException("User not found"));
    }

    @Override
    public User getOrCreateFromOAuth(String email, String name, String provider, String providerId) {
        return userRepository.findByEmail(email).orElseGet(
                ()-> {
                    User u = new User();
                    u.setEmail(email);
                    u.setName(name);
                    u.setProvider(provider);
                    u.setProviderId(providerId);
                    return userRepository.save(u);
                });
    }
}
