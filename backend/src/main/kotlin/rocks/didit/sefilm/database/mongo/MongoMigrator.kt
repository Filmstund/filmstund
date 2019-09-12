package rocks.didit.sefilm.database.mongo

import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import rocks.didit.sefilm.database.entities.*
import rocks.didit.sefilm.database.mongo.entities.ParticipantPaymentInfo
import rocks.didit.sefilm.database.mongo.repositories.*
import rocks.didit.sefilm.database.repositories.*
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
  val userIdsRepo: UserIdsRepository,
  val mongoUserRepo: UserMongoRepository,
  val movieRepo: MovieRepository,
  val mongoMovieRepo: MovieMongoRepository,
  val genreRepository: GenreRepository,
  val movieIdsRepo: MovieIdsRepository,
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
          movie = movieRepo.findById(it.movie.id).orElseThrow(),
          location = it.location?.let { l -> locationRepo.findByIdOrNull(l.name ?: "NON_EXISTANT") },
          cinemaScreen = it.filmstadenScreen?.let { screen -> CinemaScreen(screen.filmstadenId, screen.name) },
          filmstadenShowingId = it.filmstadenRemoteEntityId,
          price = it.price ?: SEK.ZERO,
          ticketsBought = it.ticketsBought,
          admin = userIdsRepo.findByGoogleId(it.admin.id)?.user ?: throw AssertionError("${it.admin.id} doesn't exist"),
          payToUser = userIdsRepo.findByGoogleId(it.payToUser.id)?.user
            ?: throw AssertionError("${it.payToUser.id} doesn't exist"),
          lastModifiedDate = it.lastModifiedDate,
          createdDate = it.createdDate
        )

        showing.participants.addAll(it.participants.map { p ->
          val user = userIdsRepo.findByGoogleId(p.userId)?.user ?: throw AssertionError("${p.userId} doesn't exist")
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
              hasPaid = paymentInfo.hasPaid,
              amountOwed = paymentInfo.amountOwed
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
                hasPaid = paymentInfo.hasPaid,
                amountOwed = paymentInfo.amountOwed
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
      title = it.title
    )

    val savedMovie = movieRepo.save(movie)

    MovieIds(it.id, movie, it.imdbId, it.tmdbId, it.filmstadenId)
      .let { ids -> movieIdsRepo.save(ids) }

    it.genres.forEach { g ->
      val genre = genreRepository.save(
        genreRepository.findByGenre(g)
          ?: Genre(genre = g)
      )
      genre.movies.add(savedMovie)
      savedMovie.genres.add(genre)
    }
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
      .filterNot { userIdsRepo.existsByGoogleId(it.id) }
      .forEach {
        migrateOldUserToNewUser(it)
      }
  }

  private fun migrateOldUserToNewUser(it: rocks.didit.sefilm.database.mongo.entities.User): User {
    val newUserId = UUID.randomUUID()
    val user = User(
      id = newUserId,
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
    }
    user.giftCertificates = giftCertificates

    val savedUser = userRepo.save(user)

    val userIds = userIdsRepo.save(
      UserIds(
        id = newUserId,
        user = savedUser,
        filmstadenId = it.filmstadenMembershipId,
        googleId = it.id
      )
    )
    savedUser.userIds = userIds
    return user
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
          assignedToUser = userIdsRepo.findByGoogleId(it.assignedToUser)?.user
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