package rocks.didit.sefilm.services

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.OpenIdConnectUserDetails
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.database.repositories.UserRepository
import rocks.didit.sefilm.domain.Foretagsbiljett
import rocks.didit.sefilm.domain.PhoneNumber
import rocks.didit.sefilm.domain.SfMembershipId
import rocks.didit.sefilm.domain.UserID
import rocks.didit.sefilm.domain.dto.*
import rocks.didit.sefilm.notification.MailSettings
import rocks.didit.sefilm.notification.NotificationSettings
import rocks.didit.sefilm.notification.PushoverSettings
import rocks.didit.sefilm.orElseThrow
import rocks.didit.sefilm.services.external.PushoverService
import rocks.didit.sefilm.services.external.PushoverValidationStatus
import java.util.*

@Service
class UserService(
  private val userRepo: UserRepository,
                  private val pushoverService: PushoverService?,
  private val foretagsbiljettService: ForetagsbiljettService
) {

  private val log: Logger = LoggerFactory.getLogger(this.javaClass)
  fun allUsers(): List<LimitedUserDTO> = userRepo.findAll().map { it.toLimitedUserDTO() }
  fun getUser(id: UserID): LimitedUserDTO? = userRepo.findById(id).map { it.toLimitedUserDTO() }.orElse(null)
  fun getUserOrThrow(id: UserID): LimitedUserDTO = getUser(id).orElseThrow { NotFoundException("user", id) }
  fun getUsersThatWantToBeNotified(knownRecipients: List<UserID>): List<User> {
    return knownRecipients.let {
      when (it.isEmpty()) {
        true -> userRepo.findAll()
        false -> userRepo.findAllById(it)
      }
    }.filter {user ->
      user.notificationSettings.let { s ->
        s.notificationsEnabled && s.providerSettings.any { it.enabled }
      }
    }
  }

  /** Get the full user with all fields. Use with care since this contains sensitive fields */
  fun getCompleteUser(id: UserID): User
    = userRepo.findById(id)
    .orElseThrow { NotFoundException("user", userID = id) }

  fun getCurrentUser(): UserDTO {
    return currentLoggedInUser().let {
      getCompleteUser(it).toDTO()
    }
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

  // TODO: listen for PushoverUserKeyInvalid and disable the key
  fun updateNotificationSettings(notificationInput: NotificationSettingsInputDTO): UserDTO {
    val currentUser = getUserEntityForCurrentUser()

    val mailSettings = notificationInput.mail.let {
      MailSettings(it?.enabled ?: false, it?.mailAddress ?: "${currentUser.firstName?.toLowerCase()}@example.org")
    }
    val pushoverSettings = notificationInput.pushover?.let {

      val validatedUserKeyStatus =
        when (it.enabled) {
          true -> pushoverService?.validateUserKey(it.userKey, it.device) ?: PushoverValidationStatus.UNKNOWN
          false -> PushoverValidationStatus.UNKNOWN
        }

      PushoverSettings(it.enabled, it.userKey, it.device, validatedUserKeyStatus)
    } ?: PushoverSettings()

    return currentUser.copy(
      notificationSettings = NotificationSettings(
        notificationInput.notificationsEnabled,
        notificationInput.enabledTypes,
        listOf(mailSettings, pushoverSettings))
    ).let {
      userRepo.save(it)
    }.also {
      log.trace("Update notification settings for user={} settings to={}", it.id, it.notificationSettings)
    }.toDTO()
  }

  fun lookupUserFromCalendarFeedId(calendarFeedId: UUID): UserDTO? = userRepo
    .findByCalendarFeedId(calendarFeedId)
    ?.toDTO()

  fun invalidateCalendarFeedId(): UserDTO {
    return getUserEntityForCurrentUser()
      .copy(calendarFeedId = UUID.randomUUID())
      .let { userRepo.save(it) }.toDTO()
  }

  fun disableCalendarFeed(): UserDTO {
    return getUserEntityForCurrentUser()
      .copy(calendarFeedId = null)
      .let { userRepo.save(it) }.toDTO()
  }

  fun User.toDTO() = UserDTO(
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
    this.notificationSettings,
    this.lastLogin,
    this.signupDate,
    this.calendarFeedId
  )

  private fun Foretagsbiljett.toDTO(): ForetagsbiljettDTO {
    return ForetagsbiljettDTO(this.number.number, this.expires, foretagsbiljettService.getStatusOfTicket(this))
  }
}