package rocks.didit.sefilm.web.controllers

import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import rocks.didit.sefilm.*
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.database.repositories.UserRepository
import rocks.didit.sefilm.domain.*
import rocks.didit.sefilm.domain.dto.FöretagsbiljettDTO
import rocks.didit.sefilm.domain.dto.UserDetailsDTO
import rocks.didit.sefilm.web.services.FöretagsbiljettService

@RestController
class UserController(val userRepository: UserRepository,
                     val företagsbiljettService: FöretagsbiljettService) {
  companion object {
    private const val BASE_PATH = Application.API_BASE_PATH + "/users"
    private const val ME_PATH = BASE_PATH + "/me"
    private const val FTG_TICKET_PATH = ME_PATH + "/ftgtickets"
  }

  @GetMapping(ME_PATH, produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun currentUser(): User {
    val currentLoggedInUser = currentLoggedInUser()
    return userRepository
      .findById(currentLoggedInUser)
      .orElseThrow { NotFoundException("user '$currentLoggedInUser'") }
  }

  @GetMapping(FTG_TICKET_PATH,  produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun getFtgTickets(): List<FöretagsbiljettDTO> {
    val currentLoggedInUser = currentLoggedInUser()
    return userRepository
            .findById(currentLoggedInUser)
            .map { u -> u.foretagsbiljetter }
            .map { tickets ->
              tickets.map { t ->
                FöretagsbiljettDTO(number = t.number.number,
                        expires = t.expires,
                        status = this.företagsbiljettService.getStatusOfTicket(t))
              }
            }
            .orElseThrow { NotFoundException("user '$currentLoggedInUser'") }
  }


  @PutMapping(FTG_TICKET_PATH, consumes = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE), produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
  fun updateFtgTickets(@RequestBody tickets: List<FöretagsbiljettDTO>): List<FöretagsbiljettDTO> {
    assertNoDuplicateForetagsbiljetter(tickets)
    val tickets = tickets.map { Företagsbiljett.valueOf(it) }
    val updatedUser = currentUser().copy(
            foretagsbiljetter = tickets
    )

    userRepository.save(updatedUser)

    return tickets.map { f ->
      FöretagsbiljettDTO(
              number = f.number.number,
              expires = f.expires,
              status = this.företagsbiljettService.getStatusOfTicket(f)
      )
    }

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
      newDetails.sfMembershipId.isNullOrBlank() -> null
      else -> SfMembershipId(newDetails.sfMembershipId!!)
    }

    val newPhoneNumber = when {
      newDetails.phone == null || newDetails.phone.isBlank() -> null
      else -> PhoneNumber(newDetails.phone)
    }

    val updatedUser = currentUser().copy(
      phone = newPhoneNumber,
      nick = newDetails.nick,
      sfMembershipId = newBioklubbnummer
    )

    return userRepository.save(updatedUser)
  }

  private fun assertNoDuplicateForetagsbiljetter(tickets: List<FöretagsbiljettDTO>) {
    val numDistinctTickets = tickets
      .map { it.number }
      .distinct()
      .size

    if (numDistinctTickets != tickets.size) {
      throw DuplicateTicketException()
    }
  }
}

