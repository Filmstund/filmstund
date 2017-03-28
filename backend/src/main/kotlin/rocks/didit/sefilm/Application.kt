package rocks.didit.sefilm

import org.slf4j.LoggerFactory
import org.springframework.boot.ApplicationRunner
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.context.annotation.Bean
import rocks.didit.sefilm.database.repositories.LocationRepository
import rocks.didit.sefilm.database.repositories.MovieRepository
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.database.repositories.UserRepository

@SpringBootApplication
class Application {
    private val log = LoggerFactory.getLogger(Application::class.java)
    @Bean
    fun initData(showings: ShowingRepository, movies: MovieRepository,
                 locations: LocationRepository, users: UserRepository) = ApplicationRunner {
        // TODO: seed persistant data here, such as locations
    }

    //@Bean
    //fun corsConfigurer(): WebMvcConfigurer {
    //    return object : WebMvcConfigurerAdapter() {
    //        override fun addCorsMappings(registry: CorsRegistry?) {
    //            registry!!.addMapping("/**").allowedOrigins("*")
    //        }
    //    }
    //}
}

fun main(args: Array<String>) {
    SpringApplication.run(Application::class.java, *args)
}
