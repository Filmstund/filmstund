package rocks.didit.sefilm.services

import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.entities.GiftCertificate
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.database.repositories.UserRepository
import rocks.didit.sefilm.domain.FilmstadenMembershipId
import rocks.didit.sefilm.domain.PhoneNumber
import rocks.didit.sefilm.domain.dto.GiftCertificateDTO
import rocks.didit.sefilm.domain.dto.NotificationSettingsInputDTO
import rocks.didit.sefilm.domain.dto.PublicUserDTO
import rocks.didit.sefilm.domain.dto.UserDTO
import rocks.didit.sefilm.domain.dto.UserDetailsDTO
import rocks.didit.sefilm.logger
import rocks.didit.sefilm.orElseThrow
import java.util.*

@Service
class UserService(
  private val userRepo: UserRepository,
  //private val pushoverService: PushoverService?,
  private val foretagsbiljettService: GiftCertificateService
) {

  private val log by logger()

  fun allUsers(): List<PublicUserDTO> = userRepo.findAllPublicUsers()
  fun getUser(id: UUID): PublicUserDTO? = userRepo.findPublicUserById(id)
  fun getUserOrThrow(id: UUID): PublicUserDTO = getUser(id).orElseThrow { NotFoundException("user", id) }
  fun getUsersThatWantToBeNotified(knownRecipients: List<UUID>): List<User> = emptyList() /*{
    return knownRecipients.let {
      when (it.isEmpty()) {
        true -> userRepo.findAll()
        false -> userRepo.findAllById(it)
      }
    }.filter { user ->
      user.notificationSettings.let { s ->
        s.notificationsEnabled && s.providerSettings.any { it.enabled }
      }
    }
  }
  */

  /** Get the full user with all fields. Use with care since this contains sensitive fields */
  fun getCompleteUser(id: UUID): User = userRepo.findById(id)
    .orElseThrow { NotFoundException("user", userID = id) }

  fun getCurrentUser(): UserDTO = currentLoggedInUser().let {
    getCompleteUser(it.id).toDTO()
  }

  fun currentUserOrNull(): User? {
    val authentication: Authentication? = SecurityContextHolder.getContext().authentication
    if (authentication?.isAuthenticated != false) {
      return null
    }

    val principal = authentication.principal as PublicUserDTO
    return getCompleteUser(principal.id)
  }

  private fun getUserEntityForCurrentUser() = userRepo.findById(currentLoggedInUser().id)
    .orElseThrow { NotFoundException("current user", currentLoggedInUser().id) }

  @Transactional
  fun updateUser(newDetails: UserDetailsDTO): UserDTO {
    val newFilmstadenMembershipId = when {
      newDetails.filmstadenMembershipId.isNullOrBlank() -> null
      else -> FilmstadenMembershipId.valueOf(newDetails.filmstadenMembershipId)
    }

    val newPhoneNumber = when {
      newDetails.phone.isNullOrBlank() -> null
      else -> PhoneNumber(newDetails.phone)
    }

    val user = getUserEntityForCurrentUser()
    user.filmstadenId = newFilmstadenMembershipId

    user.phone = newPhoneNumber
    user.nick = newDetails.nick ?: ""

    log.info("Update user {}", user.id)
    return user.toDTO()
  }

  // TODO: listen for PushoverUserKeyInvalid and disable the key
  fun updateNotificationSettings(notificationInput: NotificationSettingsInputDTO): UserDTO = getCurrentUser()/* {
    val currentUser = getUserEntityForCurrentUser()

    val mailSettings = notificationInput.mail.let {
      MailSettings(it?.enabled ?: false, it?.mailAddress ?: "${currentUser.firstName?.toLowerCase()}@example.org")
    }
    val pushoverSettings = notificationInput.pushover?.let {

      val validatedUserKeyStatus =
        when (it.enabled) {
          true -> pushoverService?.validateUserKey(it.userKey, it.device)
            ?: PushoverValidationStatus.UNKNOWN
          false -> PushoverValidationStatus.UNKNOWN
        }

      PushoverSettings(it.enabled, it.userKey, it.device, validatedUserKeyStatus)
    } ?: PushoverSettings()

    return currentUser.copy(
      notificationSettings = NotificationSettings(
        notificationInput.notificationsEnabled,
        notificationInput.enabledTypes,
        listOf(mailSettings, pushoverSettings)
      )
    ).let {
      userRepo.save(it)
    }.also {
      log.trace("Update notification settings for user={} settings to={}", it.id, it.notificationSettings)
    }.toDTO()
  }
  */

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
    this.phone?.number,
    this.avatar,
    this.giftCertificates.map { toDTO(it) },
    this.lastLogin,
    this.signupDate,
    this.calendarFeedId
  )

  private fun toDTO(giftCert: GiftCertificate): GiftCertificateDTO = giftCert.toDTO()
    .let {
      it.copy(
        status = foretagsbiljettService.getStatusOfTicket(it)
      )
    }
}