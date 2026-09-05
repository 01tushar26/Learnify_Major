package learnifyApi_service.Security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import learnifyApi_service.DTOs.LoginResponseDTO;
import learnifyApi_service.Entities.User;
import learnifyApi_service.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {
    private static final int SIX_MONTHS_SECONDS =  60 * 60 * 24 * 30 * 6;
    private final UserService userService;
    private final AuthService authService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        User user = userService.getOrCreateFromOAuth(
                email,
                oAuth2User.getAttribute("name"),
                "google",
                oAuth2User.getAttribute("sub")
        );

        LoginResponseDTO tokens = authService.issueTokensForOAuthUser(user);
        
        Cookie refreshCookie = new Cookie("refreshToken", tokens.getRefreshToken());
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(SIX_MONTHS_SECONDS);
        response.addCookie(refreshCookie);

        response.sendRedirect(
                "http://localhost:5173/oauth-success?accessToken=" + tokens.getAccessToken()
        );
    }
}
