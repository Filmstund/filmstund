package rocks.didit.sefilm

import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.context.annotation.Bean
import rocks.didit.sefilm.entities.Showing

@SpringBootApplication
class Application {
    private val log = LoggerFactory.getLogger(Application::class.java)
    @Bean
    fun init(repository: ShowingRepository) = CommandLineRunner {
        log.info("Showings:")
        val allShowings = repository.findAll()
        allShowings.forEach({s -> log.info(s.toString())})
        log.info("end showings")
    }
}

fun main(args: Array<String>) {
    SpringApplication.run(Application::class.java, *args)
}
