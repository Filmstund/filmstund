package rocks.didit.sefilm.web.controllers

import org.springframework.http.MediaType
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RestController
import rocks.didit.sefilm.Application
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.OpenIdConnectUserDetails
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.database.repositories.UserRepository

@RestController
class UserController(val userRepository: UserRepository) {
    companion object {
        private const val BASE_PATH = Application.API_BASE_PATH + "/users"
    }

    @GetMapping(BASE_PATH + "/me", produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
    fun currentUser(): User {
        val principal = SecurityContextHolder.getContext().authentication.principal as OpenIdConnectUserDetails
        return findOne(principal.userId)
    }

    @GetMapping(BASE_PATH, produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
    fun findAll() = userRepository.findAll()

    @GetMapping(BASE_PATH + "/{id}", produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
    fun findOne(@PathVariable id: String) = userRepository.findOne(id).orElseThrow { NotFoundException("user '$id'") }
}

