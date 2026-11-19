package com.mindlog.resources.handlers;

import com.mindlog.data.dtos.CustomErrorDTO;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import static org.assertj.core.api.Assertions.assertThat;

class ResourceExceptionHandlerTest {

    @Test
    void uploadTooLarge_answers413WithAStableCodeOnTheFileField() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/import");
        request.setRequestURI("/api/v1/import");

        ResponseEntity<CustomErrorDTO> response = new ResourceExceptionHandler()
                .uploadTooLarge(new MaxUploadSizeExceededException(5L * 1024 * 1024), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.PAYLOAD_TOO_LARGE);
        assertThat(response.getBody().code()).isEqualTo("file.tooLarge");
        assertThat(response.getBody().field()).isEqualTo("file");
    }
}
