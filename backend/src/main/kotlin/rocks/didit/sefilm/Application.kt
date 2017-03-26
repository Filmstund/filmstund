package rocks.didit.sefilm

import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.context.annotation.Bean
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import rocks.didit.sefilm.repositories.LocationRepository
import rocks.didit.sefilm.repositories.MovieRepository
import rocks.didit.sefilm.repositories.ShowingRepository
import rocks.didit.sefilm.repositories.UserRepository
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter



@SpringBootApplication
class Application {
    private val log = LoggerFactory.getLogger(Application::class.java)
    @Bean
    fun init(showings: ShowingRepository, movies: MovieRepository, locations: LocationRepository, users: UserRepository) = CommandLineRunner {
    }

    @Bean
    fun corsConfigurer(): WebMvcConfigurer {
        return object : WebMvcConfigurerAdapter() {
            override fun addCorsMappings(registry: CorsRegistry?) {
                registry!!.addMapping("/**").allowedOrigins("*")
            }
        }
    }
}

fun main(args: Array<String>) {
    SpringApplication.run(Application::class.java, *args)
}
