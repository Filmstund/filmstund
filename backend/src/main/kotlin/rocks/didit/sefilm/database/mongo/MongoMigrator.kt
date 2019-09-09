package rocks.didit.sefilm.database.mongo

import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import rocks.didit.sefilm.database.entities.*
import rocks.didit.sefilm.database.mongo.repositories.LocationMongoRepository
import rocks.didit.sefilm.database.mongo.repositories.MovieMongoRepository
import rocks.didit.sefilm.database.mongo.repositories.UserMongoRepository
import rocks.didit.sefilm.database.repositories.*
import rocks.didit.sefilm.logger
import java.util.*

@Component
class MongoMigrator(
  val locationRepository: LocationRepository,
  val locationsMongoRepo: LocationMongoRepository,
  val userRepo: UserRepository,
  val userIdsRepo: UserIdsRepository,
  val mongoUserRepo: UserMongoRepository,
  val movieRepo: MovieRepository,
  val mongoMovieRepo: MovieMongoRepository,
  val genreRepository: GenreRepository,
  val movieIdsRepo: MovieIdsRepository
) {
  private val log by logger()
  @Transactional
  fun migrateFromMongo() {
    migrateLocationsFromMongo()
    migrateUsersFromMongo()
    migrateMoviesFromMongo()
  }

  private fun migrateMoviesFromMongo() {
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
      .let { ids -> movie.movieIds = movieIdsRepo.save(ids) }

    it.genres.forEach { g ->
      val genre = genreRepository.save(
        genreRepository.findByGenre(g)
          ?: Genre(genre = g)
      )
      genre.movies.add(savedMovie)
      savedMovie.genres.add(genre)
    }
  }

  private fun migrateLocationsFromMongo() {
    if (log.isInfoEnabled) {
      log.info(
        "{} locations are stored in MongoDB and {} are stored in Postgres",
        locationsMongoRepo.count(),
        locationRepository.count()
      )
    }

    locationsMongoRepo.findAll()
      .filterNot { locationRepository.existsById(it.name ?: "NON_EXISTANT") }
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

        val savedLoc = locationRepository.save(pgLoc)
        log.debug("{} migrated as {}", it.name, savedLoc)
      }
  }

  private fun migrateUsersFromMongo() {
    val before = System.currentTimeMillis()
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

    val duration = System.currentTimeMillis() - before
    log.info("User migration complete in {}ms", duration)
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
}