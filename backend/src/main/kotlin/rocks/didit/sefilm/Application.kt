package rocks.didit.sefilm

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import graphql.execution.AsyncExecutionStrategy
import org.slf4j.LoggerFactory
import org.springframework.boot.ApplicationRunner
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.cache.annotation.EnableCaching
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Primary
import org.springframework.core.io.ClassPathResource
import org.springframework.data.mongodb.core.convert.MongoCustomConversions
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder
import org.springframework.scheduling.annotation.EnableAsync
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.session.data.mongo.AbstractMongoSessionConverter
import org.springframework.session.data.mongo.JdkMongoSessionConverter
import org.springframework.session.data.mongo.config.annotation.web.http.EnableMongoHttpSession
import org.springframework.web.client.RestTemplate
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import rocks.didit.sefilm.database.ImdbIdConverter
import rocks.didit.sefilm.database.TmdbIdConverter
import rocks.didit.sefilm.database.entities.BioBudord
import rocks.didit.sefilm.database.entities.Location
import rocks.didit.sefilm.database.repositories.BudordRepository
import rocks.didit.sefilm.database.repositories.LocationRepository
import rocks.didit.sefilm.database.repositories.MovieRepository
import rocks.didit.sefilm.domain.ExternalProviderErrorHandler
import rocks.didit.sefilm.domain.MovieTitleExtension
import rocks.didit.sefilm.graphql.GraphqlExceptionHandler
import rocks.didit.sefilm.services.SFService
import java.math.BigDecimal
import java.time.Duration

@SpringBootApplication
@EnableMongoHttpSession(maxInactiveIntervalInSeconds = 43200)
//@EnableMongoAuditing // TODO enable when it works together with EnableMongoHttpSession
@EnableCaching
@EnableWebSecurity
@EnableAsync
@EnableScheduling
@EnableConfigurationProperties(Properties::class)
class Application {
  private val log = LoggerFactory.getLogger(Application::class.java)

  companion object {
    const val API_BASE_PATH = "/api"
  }

  @Bean
  fun mongoSessionConverter(): AbstractMongoSessionConverter = JdkMongoSessionConverter(Duration.ofSeconds(43200))

  @Bean
  fun customMongoConverters(): MongoCustomConversions {
    val converters = listOf(ImdbIdConverter(), TmdbIdConverter())
    return MongoCustomConversions(converters)
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
        registry.addMapping("/**")
          .allowedOrigins("http://localhost:3000", "https://bio.didit.rocks")
          .allowedMethods("GET", "POST", "PUT", "DELETE", "HEAD")
          .allowCredentials(true)
      }
    }
  }

  @Bean
  fun removeUnwantedMovies(movieRepository: MovieRepository, titleExtensions: MovieTitleExtension) = ApplicationRunner {
    val unwantedMovies = movieRepository
      .findAll()
      .filter { titleExtensions.isTitleUnwanted(it.title) }
    log.info("Deleting ${unwantedMovies.size} unwanted movies")
    movieRepository.deleteAll(unwantedMovies)
  }

  @Bean
  fun trimMovieNames(movieRepository: MovieRepository, titleExtensions: MovieTitleExtension) = ApplicationRunner {
    movieRepository.findAll()
      .filter {
        titleExtensions.titleRequiresTrimming(it.title)
      }
      .forEach {
        val newTitle = titleExtensions.trimTitle(it.title)
        val updatedMovie = it.copy(title = newTitle)
        log.info("Updating title: '${it.title}' -> '$newTitle'")
        movieRepository.save(updatedMovie)
      }
  }

  @Bean
  fun seedInitialData(locationsRepo: LocationRepository,
                      budordRepo: BudordRepository,
                      sfService: SFService,
                      properties: Properties) = ApplicationRunner {
    if (!properties.tmdb.apiKeyExists()) {
      log.warn("TMDB api key not set. Some features will not work properly!")
    }

    val objectMapper: ObjectMapper = Jackson2ObjectMapperBuilder.json().build()

    val budordResource = ClassPathResource("seeds/budord.json")
    val budords: List<BioBudord> = objectMapper.readValue(budordResource.inputStream)
    budordRepo.saveAll(budords)
    log.info("Seeded budord with ${budords.size} values")

    val locationsResource = ClassPathResource("seeds/locations.json")
    val locations: List<Location> = objectMapper.readValue(locationsResource.inputStream)

    val cityAlias = "GB"
    val locationsFromSF = sfService.getLocationsInCity(cityAlias)
      .map {
        Location(it.title,
          it.address.city["alias"],
          it.address.city["name"],
          it.address.streetAddress,
          it.address.postalCode,
          it.address.postalAddress,
          BigDecimal(it.address.coordinates.latitude),
          BigDecimal(it.address.coordinates.longitude))
      }

    locationsRepo.saveAll(locations)
    log.info("Seeded locations with ${locations.size} values")

    log.info("Seeded ${locationsRepo.saveAll(locationsFromSF).count()} locations from SF for city: $cityAlias")
  }

  @Bean
  fun graphqlExecutionStrategy(graphqlExceptionHandler: GraphqlExceptionHandler) = AsyncExecutionStrategy(graphqlExceptionHandler)
}

fun main(args: Array<String>) {
  SpringApplication.run(Application::class.java, *args)
}
