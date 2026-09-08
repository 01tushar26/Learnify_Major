package learnifyApi_service.Client;

import learnifyApi_service.DTOs.RagSearchRequestDTO;
import learnifyApi_service.DTOs.RagSearchResultDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
@RequiredArgsConstructor
public class RagQueryClient {

    private final RestClient client;

    public List<RagSearchResultDTO> search(String query, Long materialId, int topK) {
        RagSearchRequestDTO request = new RagSearchRequestDTO(query, materialId, topK);

        RagSearchResultDTO[] results = client.post()
                .uri("/internal/search")
                .body(request)
                .retrieve()
                .body(RagSearchResultDTO[].class);
        return results == null ? List.of() : List.of(results);
    }

}
