package learnifyApi_service.Security;

import learnifyApi_service.DTOs.LoginResponseDTO;
import learnifyApi_service.Entities.RefreshToken;
import learnifyApi_service.Entities.User;
import learnifyApi_service.Repositories.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.LocalDate;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private final JWTService jwtService;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public LoginResponseDTO issueTokensForOAuthUser(User user) {

        refreshTokenRepository.revokeAllByUser(user);

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        RefreshToken tokenEntity = RefreshToken.builder()
                .token(refreshToken)
                .user(user)
                .expiryDate(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24 * 30 * 6))
                .revoked(false)
                .build();
        refreshTokenRepository.save(tokenEntity);

        return new LoginResponseDTO(user.getId(), accessToken, refreshToken);
    }

    // todo- regenerate refresh token again to increase privacy
    public LoginResponseDTO refresh(String refreshToken) {
        log.info("Refreshing the token");

        RefreshToken refreshToken1 = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new AuthenticationServiceException("Invalid refresh token"));

        if (refreshToken1.isRevoked()) {
            throw new AuthenticationServiceException("Token has been revoked");
        }
        if (refreshToken1.getExpiryDate().before(Date.valueOf(LocalDate.now()))) {
            throw new AuthenticationServiceException("Token expired");
        }

        User user = refreshToken1.getUser();

        refreshToken1.setRevoked(true);
        refreshTokenRepository.save(refreshToken1);

        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);

        RefreshToken newTokenEntity = RefreshToken.builder()
                .token(newRefreshToken)
                .user(user)
                .expiryDate(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24 * 30 * 6))
                .revoked(false)
                .build();
        refreshTokenRepository.save(newTokenEntity);

        return new LoginResponseDTO(user.getId(), newAccessToken, newRefreshToken);
    }

    public void logout(String refreshToken) {
        RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Token not found"));

        token.setRevoked(true);
        refreshTokenRepository.save(token);
    }
}

