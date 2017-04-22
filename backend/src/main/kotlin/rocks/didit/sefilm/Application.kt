package rocks.didit.sefilm

import org.slf4j.LoggerFactory
import org.springframework.boot.ApplicationRunner
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.cache.annotation.EnableCaching
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Primary
import org.springframework.data.mongodb.config.EnableMongoAuditing
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.web.client.RestTemplate
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import rocks.didit.sefilm.database.entities.Location
import rocks.didit.sefilm.database.repositories.LocationRepository
import rocks.didit.sefilm.database.repositories.MovieRepository
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.database.repositories.UserRepository
import rocks.didit.sefilm.domain.ExternalProviderErrorHandler
import java.math.BigDecimal


@SpringBootApplication
@EnableMongoAuditing
@EnableCaching
@EnableWebSecurity
@EnableConfigurationProperties(Properties::class)
class Application {
    private val log = LoggerFactory.getLogger(Application::class.java)

    companion object {
        const val API_BASE_PATH = "/api"
    }

    @Bean
    @Primary
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
    fun initData(locations: LocationRepository) = ApplicationRunner {
        //locations.deleteAll()
        //seedTestData(locations)
    }

    private fun seedTestData(showings: ShowingRepository, movies: MovieRepository,
                             locations: LocationRepository, users: UserRepository) {
        val seedLocations = listOf(Location("Filmstaden Bergakungen", BigDecimal("57.7022927"), BigDecimal("11.9841099")),
                Location("Biopalatset", BigDecimal("57.7034996"), BigDecimal("11.9647064")),
                Location("Göta", BigDecimal("57.6973703"), BigDecimal("11.9763771")))
        locations.save(seedLocations)
        log.info("Completed save of seed locations")
    }
}

fun main(args: Array<String>) {
    SpringApplication.run(Application::class.java, *args)
}
