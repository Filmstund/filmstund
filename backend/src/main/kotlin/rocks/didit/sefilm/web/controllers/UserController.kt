package rocks.didit.sefilm.web.controllers

import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import rocks.didit.sefilm.*
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.database.repositories.UserRepository
import rocks.didit.sefilm.domain.Företagsbiljett
import rocks.didit.sefilm.domain.UserID
import rocks.didit.sefilm.domain.dto.ForetagsbiljettDTO
import rocks.didit.sefilm.domain.dto.LimitedUserDTO
import rocks.didit.sefilm.domain.dto.UserDTO
import rocks.didit.sefilm.domain.dto.UserDetailsDTO
import rocks.didit.sefilm.services.ForetagsbiljettService
import rocks.didit.sefilm.services.UserService

@RestController
class UserController(
  val userService: UserService,
  val userRepository: UserRepository,
  val foretagsbiljettService: ForetagsbiljettService) {
  companion object {
    private const val BASE_PATH = Application.API_BASE_PATH + "/users"
    private const val ME_PATH = BASE_PATH + "/me"
    private const val FTG_TICKET_PATH = ME_PATH + "/ftgtickets"
  }

  @GetMapping(ME_PATH, produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun currentUser() = userService.currentUser()

  @GetMapping(FTG_TICKET_PATH, produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  @Deprecated("remove when graphql is used")
  fun getFtgTickets(): List<ForetagsbiljettDTO> {
    val currentLoggedInUser = currentLoggedInUser()
    return userRepository
      .findById(currentLoggedInUser)
      .orElseThrow { NotFoundException("user '$currentLoggedInUser'") }
      .foretagsbiljetter
      .map {
        ForetagsbiljettDTO(number = it.number.number,
          expires = it.expires,
          status = this.foretagsbiljettService.getStatusOfTicket(it))
      }
  }

  @PutMapping(FTG_TICKET_PATH, consumes = [(MediaType.APPLICATION_JSON_UTF8_VALUE)], produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  @Deprecated("remove when using graphql")
  fun updateFtgTickets(@RequestBody suppliedFtgTickets: List<ForetagsbiljettDTO>): List<ForetagsbiljettDTO> {
    assertNoDuplicateForetagsbiljetter(suppliedFtgTickets)
    val tickets = suppliedFtgTickets.map { Företagsbiljett.valueOf(it) }

    val updatedUser = getCurrentUser().copy(
      foretagsbiljetter = tickets
    )

    userRepository.save(updatedUser)

    return tickets.map { f ->
      ForetagsbiljettDTO(
        number = f.number.number,
        expires = f.expires,
        status = this.foretagsbiljettService.getStatusOfTicket(f)
      )
    }

  }

  @GetMapping(BASE_PATH, produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun findAll() = userService.allUsers()

  @GetMapping(BASE_PATH + "/{id}", produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun findOne(@PathVariable id: UserID): LimitedUserDTO
    = userService.getUser(id)
    .orElseThrow { NotFoundException("user", id) }

  @PutMapping(ME_PATH, consumes = [(MediaType.APPLICATION_JSON_UTF8_VALUE)], produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun updateLoggedInUser(@RequestBody newDetails: UserDetailsDTO): UserDTO
    = userService.updateUser(newDetails)

  private fun getCurrentUser(): User
    = userRepository
    .findById(currentLoggedInUser())
    .orElseThrow { NotFoundException("current user with id: ${currentLoggedInUser()}") }

  private fun assertNoDuplicateForetagsbiljetter(tickets: List<ForetagsbiljettDTO>) {
    val numDistinctTickets = tickets
      .map { it.number }
      .distinct()
      .size

    if (numDistinctTickets != tickets.size) {
      throw DuplicateTicketException()
    }
  }
}

