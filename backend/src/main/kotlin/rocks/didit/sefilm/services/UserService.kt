package rocks.didit.sefilm.services

import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.OpenIdConnectUserDetails
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.database.repositories.UserRepository
import rocks.didit.sefilm.domain.Företagsbiljett
import rocks.didit.sefilm.domain.PhoneNumber
import rocks.didit.sefilm.domain.SfMembershipId
import rocks.didit.sefilm.domain.UserID
import rocks.didit.sefilm.domain.dto.ForetagsbiljettDTO
import rocks.didit.sefilm.domain.dto.LimitedUserDTO
import rocks.didit.sefilm.domain.dto.UserDTO
import rocks.didit.sefilm.domain.dto.UserDetailsDTO
import rocks.didit.sefilm.orElseThrow
import java.util.*

@Component
class UserService(
  private val userRepo: UserRepository,
  private val foretagsbiljettService: ForetagsbiljettService
) {
  fun allUsers(): List<LimitedUserDTO> = userRepo.findAll().map { it.toLimitedUserDTO() }
  fun getUser(id: UserID): LimitedUserDTO? = userRepo.findById(id).map { it.toLimitedUserDTO() }.orElse(null)
  fun getUserOrThrow(id: UserID): LimitedUserDTO = getUser(id).orElseThrow { NotFoundException("user", id) }

  /** Get the full user with all fields. Use with care since this contains sensitive fields */
  fun getCompleteUser(id: UserID): User? = userRepo.findById(id)
    .orElse(null)

  fun currentUser(): UserDTO {
    val userID = currentLoggedInUser()
    return getCompleteUser(userID)
      ?.toDTO()
      .orElseThrow { NotFoundException("current user", userID) }
  }

  fun currentUserOrNull(): User? {
    val authentication: Authentication? = SecurityContextHolder.getContext().authentication
    if (authentication?.isAuthenticated != false) {
      return null
    }

    val principal = authentication.principal as OpenIdConnectUserDetails
    return getCompleteUser(UserID(principal.userId))
  }

  private fun getUserEntityForCurrentUser() = userRepo.findById(currentLoggedInUser())
    .orElseThrow { NotFoundException("current user", currentLoggedInUser()) }

  fun updateUser(newDetails: UserDetailsDTO): UserDTO {
    val newSfMembershipId = when {
      newDetails.sfMembershipId == null || newDetails.sfMembershipId.isBlank() -> null
      else -> SfMembershipId.valueOf(newDetails.sfMembershipId)
    }

    val newPhoneNumber = when {
      newDetails.phone == null || newDetails.phone.isBlank() -> null
      else -> PhoneNumber(newDetails.phone)
    }

    val updatedUser = getUserEntityForCurrentUser().copy(
      phone = newPhoneNumber,
      nick = newDetails.nick,
      sfMembershipId = newSfMembershipId
    )

    return userRepo.save(updatedUser).toDTO()
  }

  fun lookupUserFromCalendarFeedId(calendarFeedId: UUID): UserDTO? = userRepo
    .findByCalendarFeedId(calendarFeedId)
    ?.toDTO()

  fun invalidateCalendarFeedId(): UserDTO {
    return userRepo
      .save(
        getUserEntityForCurrentUser()
          .copy(calendarFeedId = UUID.randomUUID())
      )
      .toDTO()
  }

  fun disableCalendarFeed(): UserDTO {
    return userRepo
      .save(
        getUserEntityForCurrentUser()
          .copy(calendarFeedId = null)
      )
      .toDTO()
  }

  private fun User.toDTO() = UserDTO(
    this.id,
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
    this.signupDate,
    this.calendarFeedId
  )

  private fun Företagsbiljett.toDTO(): ForetagsbiljettDTO {
    return ForetagsbiljettDTO(this.number.number, this.expires, foretagsbiljettService.getStatusOfTicket(this))
  }
}