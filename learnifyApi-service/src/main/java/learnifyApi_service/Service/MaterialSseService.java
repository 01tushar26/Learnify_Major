package learnifyApi_service.Service;

import learnifyApi_service.DTOs.MaterialDTO;
import learnifyApi_service.Entities.User;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import static learnifyApi_service.Util.Util.getAuthenticatedUser;

@Service
public class MaterialSseService {

    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>(); // key = userId

    public SseEmitter subscribe() {
        User currentUser = getAuthenticatedUser();
        Long userId = currentUser.getId();
        SseEmitter emitter = new SseEmitter(0L); // no timeout
        emitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        Runnable cleanup = () -> {
            List<SseEmitter> list = emitters.get(userId);
            if (list != null) list.remove(emitter);
        };
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(e -> cleanup.run());

        return emitter;
    }

    public void publish(Long userId, MaterialDTO material) {
        List<SseEmitter> list = emitters.get(userId);
        if (list == null) return;

        for (SseEmitter emitter : list) {
            try {
                emitter.send(SseEmitter.event().name("status").data(material));
            } catch (Exception e) {
                list.remove(emitter);
            }
        }
    }

    // keeps proxies from closing an idle connection
    @Scheduled(fixedRate = 25000)
    public void heartbeat() {
        emitters.values().forEach(list -> list.forEach(emitter -> {
            try { emitter.send(SseEmitter.event().comment("ping")); }
            catch (Exception ignored) {}
        }));
    }
}