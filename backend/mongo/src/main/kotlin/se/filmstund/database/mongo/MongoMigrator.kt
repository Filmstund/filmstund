@file:Suppress("DEPRECATION")

package se.filmstund.database.mongo

import com.github.benmanes.caffeine.cache.Caffeine
import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.useTransactionUnchecked
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import rocks.didit.sefilm.domain.FtgBiljettParticipant
import rocks.didit.sefilm.domain.SwishParticipant
import se.filmstund.database.dao.AttendeeDao
import se.filmstund.database.dao.LocationDao
import se.filmstund.database.dao.MovieDao
import se.filmstund.database.dao.ShowingDao
import se.filmstund.database.dao.TicketDao
import se.filmstund.database.dao.UserDao
import se.filmstund.database.mongo.entities.ParticipantPaymentInfo
import se.filmstund.database.mongo.repositories.LocationMongoRepository
import se.filmstund.database.mongo.repositories.MovieMongoRepository
import se.filmstund.database.mongo.repositories.ParticipantPaymentInfoMongoRepository
import se.filmstund.database.mongo.repositories.ShowingMongoRepository
import se.filmstund.database.mongo.repositories.TicketMongoRepository
import se.filmstund.database.mongo.repositories.UserMongoRepository
import se.filmstund.domain.SEK
import se.filmstund.domain.dto.GiftCertificateDTO
import se.filmstund.domain.dto.PublicUserDTO
import se.filmstund.domain.dto.core.AttendeeDTO
import se.filmstund.domain.dto.core.CinemaScreenDTO
import se.filmstund.domain.dto.core.LocationDTO
import se.filmstund.domain.dto.core.MovieDTO
import se.filmstund.domain.dto.core.ShowingDTO
import se.filmstund.domain.dto.core.TicketDTO
import se.filmstund.domain.dto.core.UserDTO
import se.filmstund.domain.id.CalendarFeedID
import se.filmstund.domain.id.FilmstadenNcgID
import se.filmstund.domain.id.FilmstadenShowingID
import se.filmstund.domain.id.GoogleId
import se.filmstund.domain.id.MovieID
import se.filmstund.domain.id.ShowingID
import se.filmstund.domain.id.UserID
import se.filmstund.logger
import java.time.LocalDate
import java.time.LocalTime
import java.util.*

@Component
internal class MongoMigrator(
  private val jdbi: Jdbi,
  private val locationsMongoRepo: LocationMongoRepository,
  private val mongoUserRepo: UserMongoRepository,
  private val mongoMovieRepo: MovieMongoRepository,
  private val mongoShowingRepo: ShowingMongoRepository,
  private val participantPaymentInfoMongoRepo: ParticipantPaymentInfoMongoRepository,
  private val mongoTicketRepo: TicketMongoRepository
) {
  private val log by logger()

  @Transactional
  fun migrateShowingsFromMongo() {
    jdbi.useTransactionUnchecked { handle ->
      val dao = handle.attach(ShowingDao::class.java)
      val userDao = handle.attach(UserDao::class.java)
      val attendeeDao = handle.attach(AttendeeDao::class.java)
      val locationDao = handle.attach(LocationDao::class.java)
      if (log.isInfoEnabled) {
        log.info(
          "{} showings are eligible for migration from MongoDB. We have {} showings in postgres currently",
          mongoShowingRepo.count(),
          dao.count()
        )
      }

      val pgShowingIds = handle.createQuery("SELECT id FROM showing")
        .mapTo(UUID::class.java)
        .list()

      val userCache = Caffeine.newBuilder().build<GoogleId, UserID>()
      val locationCache = Caffeine.newBuilder().build<String, LocationDTO>()
      val mongoShowings = mongoShowingRepo.findByIdNotIn(pgShowingIds)
      mongoShowings
        .forEach {
          val showing = ShowingDTO(
            id = ShowingID(it.id),
            webId = it.webId,
            filmstadenShowingId = FilmstadenShowingID.from(it.filmstadenRemoteEntityId),
            slug = it.slug,
            date = it.date ?: LocalDate.ofEpochDay(0),
            time = it.time ?: LocalTime.MIDNIGHT,
            movieId = MovieID(it.movie.id),
            movieTitle = it.movie.title,
            location = locationCache.get(it.location?.name!!) { name -> locationDao.findByNameOrAlias(name) },
            cinemaScreen = it.filmstadenScreen?.let { fsScreen -> CinemaScreenDTO(fsScreen.filmstadenId, fsScreen.name) },
            price = it.price ?: SEK.ZERO,
            ticketsBought = it.ticketsBought,
            admin = userCache.get(it.admin.id) { gid -> userDao.findIdByGoogleId(gid) }
              ?: throw AssertionError("${it.admin.id} doesn't exist"),
            payToUser = userCache.get(it.payToUser.id) { gid -> userDao.findIdByGoogleId(gid) }
              ?: throw AssertionError("${it.payToUser.id} doesn't exist"),
            lastModifiedDate = it.lastModifiedDate,
            createdDate = it.createdDate
          )
          showing.cinemaScreen?.let { cs -> dao.maybeInsertCinemaScreen(cs) }
          dao.insertNewShowing(showing)
        }
      val attendees: List<AttendeeDTO> = mongoShowings
        .map { showing ->
          showing.participants.map { p ->
            val user = userCache.get(p.userId) { gid -> userDao.findIdByGoogleId(gid) }
              ?: throw AssertionError("${p.userId} doesn't exist")

            val paymentInfo = participantPaymentInfoMongoRepo.findByShowingIdAndUserId(showing.id, p.userId)
              .orElseGet {
                ParticipantPaymentInfo(
                  userId = p.userId,
                  hasPaid = false,
                  showingId = showing.id,
                  amountOwed = showing.price ?: SEK.ZERO
                )
              }

            when (p) {
              is SwishParticipant -> AttendeeDTO(
                userId = user,
                showingId = ShowingID(showing.id),
                hasPaid = paymentInfo.hasPaid,
                amountOwed = paymentInfo.amountOwed,
                type = AttendeeDTO.Type.SWISH,
                userInfo = PublicUserDTO(id = user)
              )
              is FtgBiljettParticipant -> {
                AttendeeDTO(
                  userId = user,
                  showingId = ShowingID(showing.id),
                  userInfo = PublicUserDTO(id = user),
                  hasPaid = paymentInfo.hasPaid,
                  amountOwed = paymentInfo.amountOwed,
                  type = AttendeeDTO.Type.GIFT_CERTIFICATE,
                  giftCertificateUsed = userDao.findGiftCertByUserAndNumber(user, p.ticketNumber)
                )
              }
            }
          }
        }
        .flatten()
      attendeeDao.insertAttendeeOnShowing(attendees)
    }
  }

  @Transactional
  fun migrateMoviesFromMongo() {
    jdbi.useTransactionUnchecked { handle ->
      val dao = handle.attach(MovieDao::class.java)

      if (log.isInfoEnabled) {
        log.info(
          "{} movies are eligible for migration from MongoDB. We have {} movies in postgres currently",
          mongoMovieRepo.count(), dao.count()
        )
      }
      val pgMovieIds = handle.createQuery("SELECT id FROM movie")
        .mapTo(UUID::class.java)
        .list()

      val movies = mongoMovieRepo.findByIdNotIn(pgMovieIds)
        .map {
          MovieDTO(
            id = MovieID(it.id),
            imdbId = it.imdbId,
            tmdbId = it.tmdbId,
            filmstadenId = FilmstadenNcgID.from(it.filmstadenId),
            lastModifiedDate = it.lastModifiedDate,
            archived = it.archived,
            createdDate = it.lastModifiedDate, // doesn't exist in mongo...
            slug = it.filmstadenSlug,
            originalTitle = it.originalTitle,
            popularity = it.popularity,
            popularityLastUpdated = it.popularityLastUpdated,
            poster = it.poster,
            productionYear = it.productionYear,
            releaseDate = it.releaseDate,
            runtime = it.runtime,
            synopsis = it.synopsis,
            title = it.title,
            genres = it.genres.toSet()
          )
        }

      dao.insertMovies(movies)
    }
  }

  @Transactional
  fun migrateLocationsFromMongo() {
    jdbi.useTransactionUnchecked { handle ->
      val dao = handle.attach(LocationDao::class.java)
      if (log.isInfoEnabled) {
        log.info(
          "{} locations are stored in MongoDB and {} are stored in Postgres",
          locationsMongoRepo.count(),
          dao.count()
        )
      }

      val pgLocs = locationsMongoRepo.findAll()
        .filterNot { dao.existsByName(it.name ?: "NON_EXISTANT") }
        .filterNot { it.name.isNullOrEmpty() }
        .map {
          LocationDTO(
            name = it.name!!,
            cityAlias = it.cityAlias,
            city = it.city,
            streetAddress = it.streetAddress,
            postalCode = it.postalCode,
            postalAddress = it.postalAddress,
            latitude = it.latitude,
            longitude = it.longitude,
            filmstadenId = it.filmstadenId,
            alias = it.alias
          )
        }
      dao.insertLocations(pgLocs)
      pgLocs.forEach {
        dao.insertAlias(it.name, it.alias)
      }
    }
  }

  @Transactional
  fun migrateUsersFromMongo() {
    jdbi.useTransactionUnchecked { handle ->
      val dao = handle.attach(UserDao::class.java)

      if (log.isInfoEnabled) {
        log.info(
          "{} user(s) eligible for migration in MongoDB, while {} user(s) are stored in Postgres",
          mongoUserRepo.count(), dao.count()
        )
      }

      val pgGoogleIds = handle.createQuery("SELECT google_id FROM users")
        .mapTo(String::class.java)
        .list()
        .map { GoogleId(it) }

      mongoUserRepo.findByIdNotIn(pgGoogleIds)
        .forEach {
          migrateOldUserToNewUser(dao, it)
        }
    }
  }

  private fun migrateOldUserToNewUser(dao: UserDao, it: se.filmstund.database.mongo.entities.User): UserDTO {
    val newUserId = UserID.random()
    val user = UserDTO(
      id = newUserId,
      googleId = it.id,
      calendarFeedId = CalendarFeedID.from(it.calendarFeedId),
      avatar = it.avatar,
      email = it.email,
      firstName = it.firstName ?: "N/A",
      lastName = it.lastName ?: "N/A",
      nick = it.nick ?: it.lastName ?: "N/A",
      lastLogin = it.lastLogin,
      lastModifiedDate = it.lastModifiedDate,
      signupDate = it.signupDate,
      phone = it.phone,
      filmstadenMembershipId = it.filmstadenMembershipId,
      giftCertificates = it.foretagsbiljetter.map { ticket ->
        GiftCertificateDTO(newUserId, ticket.number, ticket.expires)
      }
    )
    dao.insertUser(user)
    dao.insertGiftCertificates(user.giftCertificates)

    return user
  }

  @Transactional
  fun migrateTicketsFromMongo() {
    jdbi.useTransactionUnchecked { handle ->
      val dao = handle.attach(TicketDao::class.java)
      val userDao = handle.attach(UserDao::class.java)

      if (log.isInfoEnabled) {
        log.info(
          "{} tickets are eligible for migration from MongoDB. We have {} tickets in postgres currently",
          mongoTicketRepo.count(),
          dao.count()
        )
      }


      val pgTicketIds = handle.createQuery("SELECT id FROM ticket")
        .mapTo(String::class.java)
        .list()

      val userCache = Caffeine.newBuilder().build<GoogleId, UserID>()
      val tickets = mongoTicketRepo.findByIdNotIn(pgTicketIds)
        .map {
          TicketDTO(
            id = it.id,
            showingId = ShowingID(it.showingId),
            assignedToUser = userCache.get(it.assignedToUser) { id -> userDao.findIdByGoogleId(id) }
              ?: throw AssertionError("User ${it.assignedToUser} not found"),
            profileId = it.profileId.orNullIfBlank(),
            barcode = it.barcode,
            customerType = it.customerType,
            customerTypeDefinition = it.customerTypeDefinition,
            cinema = it.cinema,
            cinemaCity = it.cinemaCity,
            screen = it.screen,
            seatRow = it.seat.row,
            seatNumber = it.seat.number,
            date = it.date,
            time = it.time,
            movieName = it.movieName,
            movieRating = it.movieRating,
            attributes = it.showAttributes.toSet()
          )
        }

      dao.insertTickets(tickets)
    }
  }

  fun String?.orNullIfBlank(): String? {
    return if (this.isNullOrBlank()) {
      null
    } else this
  }
}