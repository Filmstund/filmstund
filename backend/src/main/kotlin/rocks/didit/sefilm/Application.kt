package rocks.didit.sefilm

import org.slf4j.LoggerFactory
import org.springframework.boot.ApplicationRunner
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.cache.annotation.EnableCaching
import org.springframework.context.annotation.Bean
import org.springframework.data.mongodb.config.EnableMongoAuditing
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.web.client.RestTemplate
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import rocks.didit.sefilm.database.entities.Location
import rocks.didit.sefilm.database.entities.Movie
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.database.repositories.LocationRepository
import rocks.didit.sefilm.database.repositories.MovieRepository
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.database.repositories.UserRepository
import rocks.didit.sefilm.domain.Bioklubbnummer
import rocks.didit.sefilm.domain.ExternalProviderErrorHandler
import java.math.BigDecimal
import java.time.Duration
import java.time.LocalDate
import java.time.LocalTime
import java.util.*


@SpringBootApplication
@EnableMongoAuditing
@EnableCaching
@EnableConfigurationProperties(Properties::class)
class Application {
    private val log = LoggerFactory.getLogger(Application::class.java)

    companion object {
        const val API_BASE_PATH = "/api"
    }

    @Bean
    fun getRestClient(): RestTemplate {
        val restClient = RestTemplate()
        restClient.errorHandler = ExternalProviderErrorHandler()
        return restClient
    }

    @Bean
    fun getHttpEntityWithJsonAcceptHeader(): HttpEntity<Void> {
        val httpHeaders = HttpHeaders()
        httpHeaders.accept = listOf(MediaType.APPLICATION_JSON_UTF8)
        httpHeaders.put("User-Agent", listOf("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36"))
        return HttpEntity(httpHeaders)
    }

    @Bean
    fun corsConfigurer(): WebMvcConfigurer {
        return object : WebMvcConfigurer {
            override fun addCorsMappings(registry: CorsRegistry) {
                registry.addMapping("/**").allowedOrigins("*")
            }
        }
    }

    @Bean
    fun initData(showings: ShowingRepository, movies: MovieRepository,
                 locations: LocationRepository, users: UserRepository) = ApplicationRunner {
        //showings.deleteAll()
        //movies.deleteAll()
        //locations.deleteAll()
        //users.deleteAll()
        //seedTestData(showings, movies, locations, users)
    }

    private fun seedTestData(showings: ShowingRepository, movies: MovieRepository,
                             locations: LocationRepository, users: UserRepository) {
        val seedLocations = listOf(Location("Filmstaden Bergakungen", BigDecimal("57.7022927"), BigDecimal("11.9841099")),
                Location("Biopalatset", BigDecimal("57.7034996"), BigDecimal("11.9647064")),
                Location("Göta", BigDecimal("57.6973703"), BigDecimal("11.9763771")))
        locations.save(seedLocations)
        log.info("Completed save of seed locations")

        val seedMovies = listOf(Movie(imdbId = "tt4425200", title = "John Wick: Chapter 2", runtime = Duration.ofHours(2).plusMinutes(2)),
                Movie(imdbId = "tt1219827", title = "Ghost in the Shell", runtime = Duration.ofHours(1).plusMinutes(46)),
                Movie(imdbId = "tt0110912", title = "Pulp Fiction", runtime = Duration.ofHours(2).plusMinutes(34)))
        movies.save(seedMovies)
        log.info("Completed save of seed movies")

        val seedUsers = listOf(
                User("Addy admin", "Addy", "adminw@example.org", Bioklubbnummer("11111111111"), "070-0000000"),
                User("Normal User 1", "Normy1", "normy1@example.org", Bioklubbnummer("11111111112"), "070-0000001"),
                User("Normal User 2", "Normy2", "normy2@example.org", null, "070-0000002"))
        users.save(seedUsers)
        log.info("Completed save of seed users")

        val seedShowings = listOf(Showing(UUID.randomUUID(), LocalDate.now(), LocalTime.now(), seedMovies.first().id, seedLocations.first(), admin = seedUsers.first(), participants = seedUsers),
                Showing(UUID.randomUUID(), LocalDate.now().plusDays(1), LocalTime.now(), seedMovies[1].id, seedLocations.first(), admin = seedUsers.first(), participants = seedUsers),
                Showing(UUID.randomUUID(), LocalDate.now().plusDays(2), LocalTime.now(), seedMovies[2].id, seedLocations[1], admin = seedUsers[1], participants = seedUsers))
        showings.save(seedShowings)
        log.info("Completed save of seed showings")
    }
}

fun main(args: Array<String>) {
    SpringApplication.run(Application::class.java, *args)
}
