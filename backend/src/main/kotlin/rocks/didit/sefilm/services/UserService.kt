package rocks.didit.sefilm.services

import org.springframework.stereotype.Component
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.database.repositories.UserRepository
import rocks.didit.sefilm.domain.Företagsbiljett
import rocks.didit.sefilm.domain.UserID
import rocks.didit.sefilm.domain.dto.FöretagsbiljettDTO
import rocks.didit.sefilm.domain.dto.LimitedUserDTO
import rocks.didit.sefilm.domain.dto.UserDTO
import java.util.*

@Component
class UserService(private val userRepo: UserRepository,
                  private val foretagsbiljettService: FöretagsbiljettService) {
  fun allUsers(): List<LimitedUserDTO> = userRepo.findAll().map { it.toLimitedUserDTO() }
  fun getUser(id: UserID): Optional<LimitedUserDTO> = userRepo.findById(id).map { it.toLimitedUserDTO() }
  fun currentUser(): UserDTO {
    val currentLoggedInUser = currentLoggedInUser()
    return userRepo.findById(currentLoggedInUser)
      .map { it.toDTO() }
      .orElseThrow { NotFoundException("current user with id: $currentLoggedInUser") }
  }

  private fun User.toDTO() = UserDTO(this.id,
    this.name,
    this.firstName,
    this.lastName,
    this.nick,
    this.email,
    this.sfMembershipId?.value,
    this.phone?.number,
    this.avatar,
    this.foretagsbiljetter.map { it.toDTO() },
    this.lastLogin,
    this.signupDate)

  private fun Företagsbiljett.toDTO(): FöretagsbiljettDTO {
    return FöretagsbiljettDTO(this.number.number, this.expires, foretagsbiljettService.getStatusOfTicket(this))
  }
}