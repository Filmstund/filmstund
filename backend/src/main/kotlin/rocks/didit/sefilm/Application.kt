package rocks.didit.sefilm

import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.context.annotation.Bean
import rocks.didit.sefilm.database.entities.Showing
import rocks.didit.sefilm.repositories.LocationRepository
import rocks.didit.sefilm.repositories.MovieRepository
import rocks.didit.sefilm.repositories.ShowingRepository
import rocks.didit.sefilm.repositories.UserRepository
import java.time.Instant
import java.util.*

@SpringBootApplication
class Application {
    private val log = LoggerFactory.getLogger(Application::class.java)
    @Bean
    fun init(showings: ShowingRepository, movies: MovieRepository, locations: LocationRepository, users: UserRepository) = CommandLineRunner {
    }
}

fun main(args: Array<String>) {
    SpringApplication.run(Application::class.java, *args)
}
