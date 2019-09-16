@file:Suppress("DEPRECATION")

package rocks.didit.sefilm.database.mongo

import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import rocks.didit.sefilm.database.entities.CinemaScreen
import rocks.didit.sefilm.database.entities.GiftCertId
import rocks.didit.sefilm.database.entities.GiftCertificate
import rocks.didit.sefilm.database.entities.Location
import rocks.didit.sefilm.database.entities.LocationAlias
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.entities.Participant
import rocks.didit.sefilm.database.entities.ParticipantId
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.database.entities.Ticket
import rocks.didit.sefilm.database.entities.TicketAttribute
import rocks.didit.sefilm.database.entities.TicketAttributeId
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.database.mongo.entities.ParticipantPaymentInfo
import rocks.didit.sefilm.database.mongo.repositories.LocationMongoRepository
import rocks.didit.sefilm.database.mongo.repositories.MovieMongoRepository
import rocks.didit.sefilm.database.mongo.repositories.ParticipantPaymentInfoMongoRepository
import rocks.didit.sefilm.database.mongo.repositories.ShowingMongoRepository
import rocks.didit.sefilm.database.mongo.repositories.TicketMongoRepository
import rocks.didit.sefilm.database.mongo.repositories.UserMongoRepository
import rocks.didit.sefilm.database.repositories.GiftCertificateRepository
import rocks.didit.sefilm.database.repositories.LocationRepository
import rocks.didit.sefilm.database.repositories.MovieRepository
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.database.repositories.TicketRepository
import rocks.didit.sefilm.database.repositories.UserRepository
import rocks.didit.sefilm.domain.FtgBiljettParticipant
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.SwishParticipant
import rocks.didit.sefilm.logger
import java.time.LocalDate
import java.util.*

@Component
class MongoMigrator(
  val locationRepo: LocationRepository,
  val locationsMongoRepo: LocationMongoRepository,
  val userRepo: UserRepository,
  val mongoUserRepo: UserMongoRepository,
  val movieRepo: MovieRepository,
  val mongoMovieRepo: MovieMongoRepository,
  val mongoShowingRepo: ShowingMongoRepository,
  val showingRepo: ShowingRepository,
  val participantPaymentInfoMongoRepo: ParticipantPaymentInfoMongoRepository,
  val giftCertificateRepo: GiftCertificateRepository,
  val mongoTicketRepo: TicketMongoRepository,
  val ticketRepo: TicketRepository
) {
  private val log by logger()

  @Transactional
  fun migrateShowingsFromMongo() {
    if (log.isInfoEnabled) {
      log.info(
        "{} showings are eligible for migration from MongoDB. We have {} showings in postgres currently",
        mongoShowingRepo.count(),
        showingRepo.count()
      )
    }

    mongoShowingRepo.findAll()
      .filterNot { showingRepo.existsById(it.id) }
      .forEach {
        val showing = Showing(
          id = it.id,
          webId = it.webId,
          slug = it.slug,
          date = it.date,
          time = it.time,
          movie = movieRepo.getOne(it.movie.id),
          location = it.location?.let { l -> locationRepo.getOne(l.name!!) },
          cinemaScreen = it.filmstadenScreen?.let { screen -> CinemaScreen(screen.filmstadenId, screen.name) },
          filmstadenShowingId = it.filmstadenRemoteEntityId,
          price = it.price ?: SEK.ZERO,
          ticketsBought = it.ticketsBought,
          admin = userRepo.findByGoogleId(it.admin.id) ?: throw AssertionError("${it.admin.id} doesn't exist"),
          payToUser = userRepo.findByGoogleId(it.payToUser.id)
            ?: throw AssertionError("${it.payToUser.id} doesn't exist"),
          lastModifiedDate = it.lastModifiedDate,
          createdDate = it.createdDate
        )

        showing.participants.addAll(it.participants.map { p ->
          val user = userRepo.findByGoogleId(p.userId) ?: throw AssertionError("${p.userId} doesn't exist")
          val paymentInfo = participantPaymentInfoMongoRepo.findByShowingIdAndUserId(it.id, p.userId)
            .orElseGet {
              ParticipantPaymentInfo(
                userId = p.userId,
                hasPaid = false,
                showingId = it.id,
                amountOwed = it.price ?: SEK.ZERO
              )
            }

          when (p) {
            is SwishParticipant -> Participant(
              id = ParticipantId(user, showing),
              hasPaid = paymentInfo.hasPaid
            )
            is FtgBiljettParticipant -> {
              if (!giftCertificateRepo.existsById_Number(p.ticketNumber)) {
                val cert =
                  GiftCertificate(id = GiftCertId(user, p.ticketNumber), expiresAt = LocalDate.EPOCH, isDeleted = true)
                giftCertificateRepo.save(cert)
              }

              Participant(
                id = ParticipantId(user, showing),
                participantType = Participant.Type.GIFT_CERTIFICATE,
                giftCertificateUsed = giftCertificateRepo.findById(GiftCertId(user, p.ticketNumber)).orElse(null),
                hasPaid = paymentInfo.hasPaid
              )
            }
          }
        })

        showingRepo.save(showing)
      }

  }

  @Transactional
  fun migrateMoviesFromMongo() {
    if (log.isInfoEnabled) {
      log.info(
        "{} movies are eligible for migration from MongoDB. We have {} movies in postgres currently",
        mongoMovieRepo.count(),
        movieRepo.count()
      )
    }

    mongoMovieRepo.findAll()
      .filterNot { movieRepo.existsById(it.id) }
      .forEach {
        migrateMovieFromMongo(it)
      }
  }

  private fun migrateMovieFromMongo(it: rocks.didit.sefilm.database.mongo.entities.Movie) {
    val movie = Movie(
      id = it.id,
      imdbId = it.imdbId,
      tmdbId = it.tmdbId,
      filmstadenId = it.filmstadenId,
      lastModifiedDate = it.lastModifiedDate,
      archived = it.archived,
      createdDate = it.lastModifiedDate,
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
      genres = it.genres.toMutableSet()
    )

    movieRepo.save(movie)
  }

  @Transactional
  fun migrateLocationsFromMongo() {
    if (log.isInfoEnabled) {
      log.info(
        "{} locations are stored in MongoDB and {} are stored in Postgres",
        locationsMongoRepo.count(),
        locationRepo.count()
      )
    }

    locationsMongoRepo.findAll()
      .filterNot { locationRepo.existsById(it.name ?: "NON_EXISTANT") }
      .filterNot { it.name.isNullOrEmpty() }
      .forEach {
        val pgLoc = Location(
          name = it.name!!,
          cityAlias = it.cityAlias,
          city = it.city,
          streetAddress = it.streetAddress,
          postalCode = it.postalCode,
          postalAddress = it.postalAddress,
          latitude = it.latitude,
          longitude = it.longitude,
          filmstadenId = it.filmstadenId,
          alias = it.alias.map { name -> LocationAlias(name) }
        )

        val savedLoc = locationRepo.save(pgLoc)
        log.debug("{} migrated as {}", it.name, savedLoc)
      }
  }

  @Transactional
  fun migrateUsersFromMongo() {
    if (log.isInfoEnabled) {
      log.info(
        "{} user(s) eligible for migration in MongoDB, while {} user(s) are stored in Postgres",
        mongoUserRepo.count(), userRepo.count()
      )
    }

    mongoUserRepo.findAll()
      .filterNot { userRepo.existsByGoogleId(it.id) }
      .forEach {
        migrateOldUserToNewUser(it)
      }
  }

  private fun migrateOldUserToNewUser(it: rocks.didit.sefilm.database.mongo.entities.User): User {
    val newUserId = UUID.randomUUID()
    val user = User(
      id = newUserId,
      googleId = it.id,
      calendarFeedId = it.calendarFeedId,
      avatar = it.avatar,
      email = it.email,
      firstName = it.firstName ?: "N/A",
      lastName = it.lastName ?: "N/A",
      nick = it.nick ?: it.lastName ?: "N/A",
      lastLogin = it.lastLogin,
      lastModifiedDate = it.lastModifiedDate,
      signupDate = it.signupDate,
      phone = it.phone
    )
    val giftCertificates = it.foretagsbiljetter.map { ticket ->
      GiftCertificate(
        id = GiftCertId(
          user,
          ticket.number
        ), expiresAt = ticket.expires
      )
    }.toMutableList()
    user.giftCertificates = giftCertificates

    return userRepo.save(user)
  }

  @Transactional
  fun migrateTicketsFromMongo() {
    if (log.isInfoEnabled) {
      log.info(
        "{} tickets are eligible for migration from MongoDB. We have {} tickets in postgres currently",
        mongoTicketRepo.count(),
        ticketRepo.count()
      )
    }

    mongoTicketRepo.findAll()
      .filterNot { ticketRepo.existsById(it.id) }
      .forEach {
        val ticket = Ticket(
          id = it.id,
          showing = showingRepo.findById(it.showingId).orElseThrow(),
          assignedToUser = userRepo.findByGoogleId(it.assignedToUser)
            ?: throw AssertionError("${it.assignedToUser} doesn't exist"),
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
          movieRating = it.movieRating
        )

        ticket.showAttributes.addAll(it.showAttributes.map { attrib ->
          TicketAttribute(TicketAttributeId(ticket, attrib))
        })

        ticketRepo.save(ticket)
      }
  }

  fun String?.orNullIfBlank(): String? {
    return if (this.isNullOrBlank()) {
      null
    } else this
  }
}