package rocks.didit.sefilm.web.controllers

import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RestController
import rocks.didit.sefilm.Application
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.database.repositories.UserRepository
import rocks.didit.sefilm.domain.LimitedUserInfo
import rocks.didit.sefilm.toLimitedUserInfo

@RestController
class UserController(val userRepository: UserRepository) {
    companion object {
        private const val BASE_PATH = Application.API_BASE_PATH + "/users"
    }

    @GetMapping(BASE_PATH + "/me", produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
    fun currentUser(): User {
        val currentLoggedInUserId = currentLoggedInUser().id
        return userRepository
                .findById(currentLoggedInUserId)
                .orElseThrow { NotFoundException("user '$currentLoggedInUserId'") }
    }

    @GetMapping(BASE_PATH, produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
    fun findAll(): Iterable<LimitedUserInfo> = userRepository.findAll().map(User::toLimitedUserInfo)

    @GetMapping(BASE_PATH + "/{id}", produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
    fun findOne(@PathVariable id: String): LimitedUserInfo =
            userRepository.findById(id)
                    .map(User::toLimitedUserInfo)
                    .orElseThrow { NotFoundException("user '$id'") }
}

