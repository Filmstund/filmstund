package rocks.didit.sefilm.services

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.inTransactionUnchecked
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.dao.UserDao
import rocks.didit.sefilm.domain.id.FilmstadenMembershipId
import rocks.didit.sefilm.domain.PhoneNumber
import rocks.didit.sefilm.domain.dto.NotificationSettingsInputDTO
import rocks.didit.sefilm.domain.dto.PublicUserDTO
import rocks.didit.sefilm.domain.dto.UserDetailsDTO
import rocks.didit.sefilm.domain.dto.core.UserDTO
import rocks.didit.sefilm.logger
import rocks.didit.sefilm.maybeCurrentLoggedInUser
import java.time.Instant
import java.util.*

@Service
class UserService(
  private val jdbi: Jdbi,
  private val userDao: UserDao
  //private val pushoverService: PushoverService?,
) {

  private val log by logger()

  fun allUsers(): List<PublicUserDTO> = userDao.findAllPublicUsers()
  fun getUser(id: UUID): PublicUserDTO? = userDao.findPublicUserById(id)
  fun getUserOrThrow(id: UUID): PublicUserDTO = getUser(id)
    ?: throw NotFoundException("user", id)

  fun getUsersThatWantToBeNotified(knownRecipients: List<UUID>): List<UserDTO> = emptyList() /*{
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
  fun getCompleteUser(id: UUID): UserDTO = userDao.findById(id)
    ?: throw NotFoundException("user", userID = id)

  fun getCurrentUser(): UserDTO = getCurrentUserOrNull()
    ?: throw AccessDeniedException("No user logged in")

  fun getCurrentUserOrNull(): UserDTO? = maybeCurrentLoggedInUser()?.let { u -> getCompleteUser(u.id) }

  fun updateUser(newDetails: UserDetailsDTO): UserDTO {
    val newFilmstadenMembershipId = newDetails.filmstadenMembershipId?.let { FilmstadenMembershipId.valueOf(it) }
    val newPhoneNumber = newDetails.phone?.let { PhoneNumber(it) }

    val currentUser = currentLoggedInUser()
    log.info("Update user {}", currentUser.id)
    return jdbi.inTransactionUnchecked {
      val dao = it.attach(UserDao::class.java)
      dao.updateUser(currentUser.id, newFilmstadenMembershipId, newPhoneNumber, newDetails.nick ?: "")
      dao.findById(currentUser.id)!!
    }
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

  fun invalidateCalendarFeedId(): UserDTO {
    return updateCalendarFeedIdForCurrentUser(UUID.randomUUID())
  }

  fun disableCalendarFeed(): UserDTO {
    return updateCalendarFeedIdForCurrentUser(null)
  }

  private fun updateCalendarFeedIdForCurrentUser(newFeedId: UUID?): UserDTO {
    return jdbi.inTransactionUnchecked {
      it.createUpdate("UPDATE users SET calendar_feed_id = :newFeedId, last_modified_date = :now WHERE id = :userId")
        .bind("newFeedId", newFeedId)
        .bind("now", Instant.now())
        .bind("userId", currentLoggedInUser().id)
        .execute()

      it.attach(UserDao::class.java).findById(currentLoggedInUser().id)!!
    }
  }
}