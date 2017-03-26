package rocks.didit.sefilm

import org.springframework.boot.CommandLineRunner
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.context.annotation.Bean
import rocks.didit.sefilm.entities.Showing

@SpringBootApplication
class Application {
    @Bean
    fun init(repository: ShowingRepository) = CommandLineRunner {
        repository.save(Showing(-1, "John Wick 2"))
        repository.save(Showing(-1, "Life"))
        repository.save(Showing(-1, "Star Wars"))
        repository.save(Showing(-1, "Alfons"))
    }
}

fun main(args: Array<String>) {
    SpringApplication.run(Application::class.java, *args)
}
