package learnifyApi_service.MessageBroker;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VideoIngestMessage implements Serializable {
    private Long materialId;
    private String jobId;
    private String filename;
    private byte[] fileBytes;
    private String contentType;
}
