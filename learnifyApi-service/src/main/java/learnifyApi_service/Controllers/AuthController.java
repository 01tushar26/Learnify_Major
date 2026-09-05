package learnifyApi_service.Controllers;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import learnifyApi_service.DTOs.LoginResponseDTO;
import learnifyApi_service.Security.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private static final int SIX_MONTHS_SECONDS = 60 * 60 * 24 * 30 * 6;

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponseDTO> refreshToken(HttpServletRequest request, HttpServletResponse response){
        Cookie[] cookie = request.getCookies();
        if(cookie == null || cookie.length == 0){
            throw new AuthenticationServiceException("No Cookies found");
        }
        String refreshToken = Arrays.stream(cookie)
                .filter(p->"refreshToken".equals(p.getName()))
                .findFirst()
                .map(Cookie::getValue)
                .orElseThrow(()->new AuthenticationServiceException("No Refresh Token found"));

        LoginResponseDTO loginResponseDTO= authService.refresh(refreshToken);

        Cookie cookie2 = new Cookie("refreshToken", loginResponseDTO.getRefreshToken());

        cookie2.setHttpOnly(true); // Prevents client-side scripts from accessing the cookie
        cookie2.setPath("/");
        int sixMonths = 60 * 60 * 24 * 30 * 6;
        cookie2.setMaxAge(sixMonths);
        response.addCookie(cookie2);


        return ResponseEntity.ok(loginResponseDTO);
    }

    @PostMapping("/logout")
    public ResponseEntity<Boolean> logout(HttpServletRequest request, HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null || cookies.length == 0) {
            throw new AuthenticationServiceException("No cookies found");
        }

        String refreshToken = Arrays.stream(cookies)
                .filter(c -> "refreshToken".equals(c.getName()))
                .findFirst()
                .map(Cookie::getValue)
                .orElse(null);

        if (refreshToken != null) {
            authService.logout(refreshToken);
        }

        // remove cookie
        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        return ResponseEntity.ok(true);
    }


}
