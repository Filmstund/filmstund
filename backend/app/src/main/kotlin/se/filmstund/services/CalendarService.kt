package se.filmstund.services

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
import se.filmstund.Properties
import se.filmstund.database.dao.AttendeeDao
import se.filmstund.database.dao.MovieDao
import se.filmstund.database.dao.ShowingDao
import se.filmstund.domain.SEK
import se.filmstund.domain.dto.core.MovieDTO
import se.filmstund.domain.dto.core.ShowingDTO
import se.filmstund.domain.id.CalendarFeedID
import se.filmstund.domain.id.ShowingID
import se.filmstund.domain.id.UserID
import java.time.Duration
import java.time.Instant
import java.time.LocalDateTime
import java.util.*

@Service
class CalendarService(
  private val jdbi: Jdbi,
  private val showingDao: ShowingDao,
  private val movieDao: MovieDao,
  private val attendeeDao: AttendeeDao,
  private val properties: Properties
) {

  private val calendarDescription: String = "Dina visningar på $CALENDAR_NAME (${properties.baseUrl.frontend})"

  companion object {
    private const val CALENDAR_NAME = "Filmstund"
    private val stockholmZoneId = TimeZone.getTimeZone("Europe/Stockholm").toZoneId()
  }

  data class IdAndMail(val id: UserID, val email: String)

  fun getCalendarFeed(userFeedId: CalendarFeedID): ICalendar {
    val (userId, mail) = jdbi.inTransactionUnchecked {
      it.select("SELECT id, email FROM users WHERE calendar_feed_id = ?", userFeedId)
        .mapTo<IdAndMail>()
        .findOne().orElse(null)
    } ?: return setupCalendar(userFeedId)

    val cal = setupCalendar(userFeedId)
    showingDao
      .findByAdminOrAttendee(userId)
      .map { it.toVEvent(userId, mail) }
      .forEach { cal.addEvent(it) }

    return cal
  }

  private fun setupCalendar(id: CalendarFeedID): ICalendar {
    val calendar = ICalendar()
    calendar.setUid(id.toString())
    calendar.setExperimentalProperty("X-WR-RECALID", id.toString())
    calendar.setMethod("PUBLISH")
    calendar.productId = ProductId("-//cthdidIT//filmstund//EN")
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
    vEvent.setLocation(this.location.formatAddress())
    vEvent.setDescription(formatDescription(this.id, userId, movie) + "\n\n$showingUrl")
    vEvent.setUrl(showingUrl)
    vEvent.addCategories(Categories("bio"))
    vEvent.addAttendees(this, userEmail)
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

  private fun formatDescription(showingId: ShowingID, userId: UserID, movie: MovieDTO): String {
    val (amountOwed, hasPaid, payToPhone) = jdbi.withHandleUnchecked {
      it.select(
        "SELECT a.amount_owed, a.has_paid, u.phone FROM attendee a JOIN showing s on a.showing_id = s.id JOIN users u on s.pay_to_user = u.id WHERE a.showing_id = ? AND a.user_id = ?",
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

  private fun VEvent.addAttendees(showingDTO: ShowingDTO, mail: String) {
    attendeeDao.findAllAttendees(showingDTO.id).forEach {
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


