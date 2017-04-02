package rocks.didit.sefilm.domain

import org.springframework.http.HttpStatus
import org.springframework.web.reactive.function.server.ServerResponse
import org.springframework.web.reactive.function.server.body
import reactor.core.publisher.Mono
import reactor.core.publisher.toMono
import rocks.didit.sefilm.json

data class Error(val error: Boolean = true,
                 val reason: String? = null)

fun String.toErrorResponse(status: HttpStatus): Mono<ServerResponse> {
    val error = Error(true, this).toMono()
    return ServerResponse
            .status(status)
            .json()
            .body(error)
}

fun whatNotFound(what: String) = "$what not found".toErrorResponse(HttpStatus.NOT_FOUND)
