package rocks.didit.sefilm

import org.springframework.http.MediaType
import org.springframework.web.reactive.function.server.ServerRequest
import org.springframework.web.reactive.function.server.ServerResponse
import reactor.core.publisher.Mono
import java.util.*

fun ServerResponse.BodyBuilder.json() = contentType(MediaType.APPLICATION_JSON_UTF8)
        .header("Access-Control-Allow-Origin", "/")

fun ServerRequest.uuidMonoPathVariable(name: String): Mono<UUID> {
    try {
        return Mono.just(UUID.fromString(this.pathVariable(name)))
    } catch(e: IllegalArgumentException) {
        return Mono.error(e)
    }
}
