package rocks.didit.sefilm.web.controllers

import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import rocks.didit.sefilm.Application
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.database.repositories.UserRepository
import rocks.didit.sefilm.domain.Bioklubbnummer
import rocks.didit.sefilm.domain.LimitedUserInfo
import rocks.didit.sefilm.domain.PhoneNumber
import rocks.didit.sefilm.domain.UserID
import rocks.didit.sefilm.domain.dto.UserDetailsDTO
import rocks.didit.sefilm.toLimitedUserInfo

@RestController
class UserController(val userRepository: UserRepository) {
  companion object {
    private const val BASE_PATH = Application.API_BASE_PATH + "/users"
    private const val ME_PATH = BASE_PATH + "/me"
  }

  @GetMapping(ME_PATH, produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun currentUser(): User {
    val currentLoggedInUser = currentLoggedInUser()
    return userRepository
      .findById(currentLoggedInUser)
      .orElseThrow { NotFoundException("user '$currentLoggedInUser'") }
  }

  @GetMapping(BASE_PATH, produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun findAll(): Iterable<LimitedUserInfo> = userRepository.findAll().map(User::toLimitedUserInfo)

  @GetMapping(BASE_PATH + "/{id}", produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun findOne(@PathVariable id: UserID): LimitedUserInfo =
    userRepository.findById(id)
      .map(User::toLimitedUserInfo)
      .orElseThrow { NotFoundException("user '$id'") }

  @PutMapping(ME_PATH, consumes = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE), produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun updateLoggedInUser(@RequestBody newDetails: UserDetailsDTO): User {
    val newBioklubbnummer = when {
      newDetails.bioklubbnummer.isNullOrBlank() -> null
      else -> Bioklubbnummer(newDetails.bioklubbnummer!!)
    }

    val newPhoneNumber = when {
      newDetails.phone == null || newDetails.phone.isBlank() -> null
      else -> PhoneNumber(newDetails.phone)
    }

    val updatedUser = currentUser().copy(
      phone = newPhoneNumber,
      nick = newDetails.nick,
      bioklubbnummer = newBioklubbnummer)

    return userRepository.save(updatedUser)
  }
}

