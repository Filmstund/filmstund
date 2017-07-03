package rocks.didit.sefilm

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.slf4j.LoggerFactory
import org.springframework.boot.ApplicationRunner
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.cache.annotation.EnableCaching
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Primary
import org.springframework.core.io.ClassPathResource
import org.springframework.data.mongodb.config.EnableMongoAuditing
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder
import org.springframework.scheduling.annotation.EnableAsync
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.web.client.RestTemplate
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import rocks.didit.sefilm.database.entities.BioBudord
import rocks.didit.sefilm.database.entities.Location
import rocks.didit.sefilm.database.repositories.BudordRepository
import rocks.didit.sefilm.database.repositories.LocationRepository
import rocks.didit.sefilm.domain.ExternalProviderErrorHandler

@SpringBootApplication
@EnableMongoAuditing
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
        registry.addMapping("/**").allowedOrigins("*").allowedMethods("GET", "POST", "PUT", "DELETE", "HEAD")
      }
    }
  }

  @Bean
  fun seedInitialData(locationsRepo: LocationRepository,
                      budordRepo: BudordRepository) = ApplicationRunner {
    val objectMapper: ObjectMapper = Jackson2ObjectMapperBuilder.json().build()

    val budordResource = ClassPathResource("seeds/budord.json")
    val budords: List<BioBudord> = objectMapper.readValue(budordResource.inputStream)
    budordRepo.saveAll(budords)
    log.info("Seeded budord with ${budords.size} values")

    val locationsResource = ClassPathResource("seeds/locations.json")
    val locations: List<Location> = objectMapper.readValue(locationsResource.inputStream)
    locationsRepo.saveAll(locations)
    log.info("Seeded locations with ${locations.size} values")
  }
}

fun main(args: Array<String>) {
  SpringApplication.run(Application::class.java, *args)
}
