package rocks.didit.sefilm

import org.slf4j.LoggerFactory
import org.springframework.boot.ApplicationRunner
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.context.annotation.Bean
import org.springframework.web.reactive.config.CorsRegistry
import rocks.didit.sefilm.database.entities.Location
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.database.repositories.LocationRepository
import rocks.didit.sefilm.database.repositories.MovieRepository
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.database.repositories.UserRepository
import rocks.didit.sefilm.domain.Bioklubbnummer
import java.math.BigDecimal
import java.time.Duration
import java.time.LocalDate
import java.time.LocalTime
import java.util.*

@SpringBootApplication
class Application {
    private val log = LoggerFactory.getLogger(Application::class.java)
    @Bean
    fun initData(showings: ShowingRepository, movies: MovieRepository,
                 locations: LocationRepository, users: UserRepository) = ApplicationRunner {
        showings.deleteAll()
        movies.deleteAll()
        locations.deleteAll()
        users.deleteAll()
        seedTestData(showings, movies, locations, users)
    }

    private fun seedTestData(showings: ShowingRepository, movies: MovieRepository,
                             locations: LocationRepository, users: UserRepository) {
        val seedLocations = listOf(Location("Filmstaden Bergakungen", BigDecimal("57.7022927"), BigDecimal("11.9841099")),
                Location("Biopalatset", BigDecimal("57.7034996"), BigDecimal("11.9647064")),
                Location("Göta", BigDecimal("57.6973703"), BigDecimal("11.9763771")))
        locations.save(seedLocations)
                .doOnComplete { log.info("Completed save of seed locations") }
                .subscribe()

        val seedMovies = listOf(Movie("tt4425200", "John Wick: Chapter 2", Duration.ofHours(2).plusMinutes(2)),
                Movie("tt1219827", "Ghost in the Shell", Duration.ofHours(1).plusMinutes(46)),
                Movie("tt0110912", "Pulp Fiction", Duration.ofHours(2).plusMinutes(34)))
        movies.save(seedMovies)
                .doOnComplete { log.info("Completed save of seed movies") }
                .subscribe()

        val seedUsers = listOf(
                User("Addy admin", "Addy", "adminw@example.org", Bioklubbnummer("11111111111"), "070-0000000"),
                User("Normal User 1", "Normy1", "normy1@example.org", Bioklubbnummer("11111111112"), "070-0000001"),
                User("Normal User 2", "Normy2", "normy2@example.org", null, "070-0000002"))
        users.save(seedUsers)
                .doOnComplete { log.info("Completed save of seed users") }
                .subscribe()

        val seedShowings = listOf(Showing(UUID.randomUUID(), LocalDate.now(), LocalTime.now(), seedMovies.first(), seedLocations.first(), seedUsers.first(), seedUsers),
                Showing(UUID.randomUUID(), LocalDate.now().plusDays(1), LocalTime.now(), seedMovies[1], seedLocations.first(), seedUsers.first(), seedUsers),
                Showing(UUID.randomUUID(), LocalDate.now().plusDays(2), LocalTime.now(), seedMovies[2], seedLocations[1], seedUsers[1], seedUsers))
        showings.save(seedShowings)
                .doOnComplete { log.info("Completed save of seed showings") }
                .subscribe()
    }
}

fun main(args: Array<String>) {
    SpringApplication.run(Application::class.java, *args)
}
