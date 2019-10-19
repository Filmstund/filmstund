package rocks.didit.sefilm.services

import biweekly.ICalendar
import biweekly.component.VAlarm
import biweekly.component.VEvent
import biweekly.parameter.CalendarUserType
import biweekly.parameter.ParticipationLevel
import biweekly.parameter.ParticipationStatus
import biweekly.parameter.Role
import biweekly.property.Attendee
import biweekly.property.CalendarScale
import biweekly.property.Categories
import biweekly.property.Created
import biweekly.property.LastModified
import biweekly.property.ProductId
import biweekly.property.Status
import biweekly.property.Transparency
import biweekly.property.Trigger
import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.inTransactionUnchecked
import org.jdbi.v3.core.kotlin.mapTo
import org.jdbi.v3.core.kotlin.withHandleUnchecked
import org.springframework.stereotype.Service
import rocks.didit.sefilm.Properties
import rocks.didit.sefilm.database.dao.MovieDao
import rocks.didit.sefilm.database.dao.ParticipantDao
import rocks.didit.sefilm.database.dao.ShowingDao
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.dto.core.MovieDTO
import rocks.didit.sefilm.domain.dto.core.ShowingDTO
import rocks.didit.sefilm.domain.id.UserID
import java.time.Duration
import java.time.Instant
import java.time.LocalDateTime
import java.util.*

@Service
class CalendarService(
  private val jdbi: Jdbi,
  private val showingDao: ShowingDao,
  private val movieDao: MovieDao,
  private val participantDao: ParticipantDao,
  private val properties: Properties
) {

  private val calendarDescription: String = "Dina visningar på $CALENDAR_NAME (${properties.baseUrl.frontend})"

  companion object {
    private const val CALENDAR_NAME = "SeFilm"
    private val stockholmZoneId = TimeZone.getTimeZone("Europe/Stockholm").toZoneId()
  }

  data class IdAndMail(val id: UserID, val email: String)

  fun getCalendarFeed(userFeedId: UUID): ICalendar {
    val (userId, mail) = jdbi.inTransactionUnchecked {
      it.select("SELECT id, email FROM users WHERE calendar_feed_id = ?", userFeedId)
        .mapTo<IdAndMail>()
        .findOne().orElse(null)
    } ?: return setupCalendar(userFeedId)

    val cal = setupCalendar(userFeedId)
    showingDao
      .findByAdminOrParticipant(userId)
      .map { it.toVEvent(userId, mail) }
      .forEach { cal.addEvent(it) }

    return cal
  }

  private fun setupCalendar(id: UUID): ICalendar {
    val calendar = ICalendar()
    calendar.setUid(id.toString())
    calendar.setExperimentalProperty("X-WR-RECALID", id.toString())
    calendar.setMethod("PUBLISH")
    calendar.productId = ProductId("-//cthdidIT//itbio//EN")
    calendar.calendarScale = CalendarScale.gregorian()
    calendar.addName(CALENDAR_NAME)
    calendar.addExperimentalProperty("X-WR-CALNAME", CALENDAR_NAME)
    calendar.addExperimentalProperty("X-WR-CALDESC", calendarDescription)
    calendar.addDescription(calendarDescription)

    return calendar
  }

  private fun ShowingDTO.toVEvent(userId: UserID, userEmail: String): VEvent {
    val movie = movieDao.findById(this.movieId) ?: return VEvent()
    val showingUrl = "${properties.baseUrl.frontend}/showings/$webId/$slug"

    val vEvent = VEvent()
    vEvent.setSummary(movie.title).language = "en-us"
    vEvent.setDateStart(Date.from(this.getStartDate()))
    vEvent.setDateEnd(this.getEndDate(movie))
    vEvent.setUid(this.id.toString())
    vEvent.setLocation(this.location?.formatAddress())
    vEvent.setDescription(formatDescription(this.id, userId, movie) + "\n\n$showingUrl")
    vEvent.setUrl(showingUrl)
    vEvent.addCategories(Categories("bio"))
    vEvent.addParticipants(this, userEmail)
    vEvent.setOrganizer(userEmail)
    vEvent.status = if (this.ticketsBought) Status.confirmed() else Status.tentative()
    vEvent.created = Created(Date.from(this.createdDate))
    vEvent.lastModified = LastModified(Date.from(this.lastModifiedDate))
    vEvent.transparency = Transparency.opaque()

    val alarmTriggerDate =
      Date.from(this.getStartDate().minusMillis(properties.calendar.durationBeforeAlert.toMillis()))
    vEvent.addAlarm(VAlarm.audio(Trigger(alarmTriggerDate)))

    return vEvent
  }

  data class PaymentDetails(val amountOwed: SEK = SEK.ZERO, val hasPaid: Boolean? = null, val phone: String? = null)

  private fun formatDescription(showingId: UUID, userId: UserID, movie: MovieDTO): String {
    val (amountOwed, hasPaid, payToPhone) = jdbi.withHandleUnchecked {
      it.select(
        "SELECT p.amount_owed, p.has_paid, u.phone FROM participant p JOIN showing s on p.showing_id = s.id JOIN users u on s.pay_to_user = u.id WHERE p.showing_id = ? AND p.user_id = ?",
        showingId,
        userId
      ).mapTo<PaymentDetails>()
        .findOne()
        .orElse(PaymentDetails())
    }

    return if (hasPaid == null || hasPaid) {
      "Kolla på bio!\n${if (movie.imdbId?.isSupplied() == true) "http://www.imdb.com/title/${movie.imdbId?.value}/" else ""}"
    } else {
      "Betala ${amountOwed.toKronor()} kr till $payToPhone"
    }
  }

  private fun VEvent.addParticipants(showingDTO: ShowingDTO, mail: String) {
    participantDao.findAllParticipants(showingDTO.id).forEach {
      val attendee = Attendee("${it.userInfo.firstName} '${it.userInfo.nick}' ${it.userInfo.lastName}", mail)
      attendee.calendarUserType = CalendarUserType.INDIVIDUAL
      attendee.participationStatus = ParticipationStatus.ACCEPTED
      attendee.role = Role.ATTENDEE
      attendee.participationLevel = ParticipationLevel.REQUIRED

      this.addAttendee(attendee)
    }
  }

  private fun ShowingDTO.getStartDate(): Instant {
    return LocalDateTime.of(this.date, this.time)
      .atZone(stockholmZoneId)
      .toInstant()
  }

  private fun ShowingDTO.getEndDate(movie: MovieDTO): Date {
    val end = this.getStartDate()
      .plusMillis(movie.getDurationOrDefault2hours().toMillis())
    return Date.from(end)
  }

  private fun MovieDTO.getDurationOrDefault2hours() = when {
    this.runtime.isZero -> Duration.ofHours(2).plusMinutes(30)
    else -> this.runtime
  }
}


