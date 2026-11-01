package learnifyApi_service.Util;

import learnifyApi_service.Entities.User;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class Util {
    public static User getAuthenticatedUser() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("No authenticated user found");
        }
        return (User) auth.getPrincipal();
    }

        public static String extractJson(String raw) {
            if (raw == null || raw.isBlank()) throw new IllegalStateException("Empty LLM response");
            String s = raw.trim().replaceAll("^```[a-zA-Z]*\\n?", "").replaceAll("```$", "").trim();
            int start = s.indexOf('{'), end = s.lastIndexOf('}');
            if (start == -1 || end == -1) throw new IllegalStateException("No JSON object found");
            return s.substring(start, end + 1);
        }
    }

