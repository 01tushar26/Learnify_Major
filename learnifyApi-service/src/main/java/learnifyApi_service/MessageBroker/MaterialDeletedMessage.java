package learnifyApi_service.MessageBroker;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MaterialDeletedMessage implements Serializable {
    private Long materialId;
}
