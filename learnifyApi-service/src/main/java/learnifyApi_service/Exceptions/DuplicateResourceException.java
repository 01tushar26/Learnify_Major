package learnifyApi_service.Exceptions;

import lombok.Getter;

@Getter
    public class DuplicateResourceException extends RuntimeException {
        private final String jobId;
        private final String status;

        public DuplicateResourceException(String message, String jobId, String status) {
            super(message);
            this.jobId = jobId;
            this.status = status;
        }
    }

