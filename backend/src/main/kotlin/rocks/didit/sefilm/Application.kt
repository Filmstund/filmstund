package rocks.didit.sefilm

import com.coxautodev.graphql.tools.SchemaParserDictionary
import com.coxautodev.graphql.tools.SchemaParserOptions
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import graphql.execution.AsyncExecutionStrategy
import graphql.servlet.config.ObjectMapperConfigurer
import kotlinx.coroutines.ExperimentalCoroutinesApi
import org.apache.http.client.HttpClient
import org.apache.http.impl.client.HttpClientBuilder
import org.slf4j.LoggerFactory
import org.springframework.boot.ApplicationRunner
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.runApplication
import org.springframework.cache.annotation.EnableCaching
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Primary
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.client.BufferingClientHttpRequestFactory
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory
import org.springframework.scheduling.annotation.EnableAsync
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.transaction.annotation.EnableTransactionManagement
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.client.RestTemplate
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import rocks.didit.sefilm.database.mongo.MongoMigrator
import rocks.didit.sefilm.domain.ExternalProviderErrorHandler
import rocks.didit.sefilm.graphql.GraphqlExceptionHandler
import rocks.didit.sefilm.logging.OutgoingLoggingInterceptor
import rocks.didit.sefilm.notification.MailSettings
import rocks.didit.sefilm.notification.PushoverSettings
import rocks.didit.sefilm.web.controllers.CalendarController

@SpringBootApplication
@EnableCaching
@EnableWebSecurity
@EnableAsync
@EnableScheduling
@EnableConfigurationProperties(Properties::class)
@EnableMongoRepositories(basePackages = ["rocks.didit.sefilm.database.mongo.repositories"])
@EnableJpaRepositories(basePackages = ["rocks.didit.sefilm.database.repositories"])
@EnableTransactionManagement
class Application {
  private val log = LoggerFactory.getLogger(Application::class.java)

  companion object {
    const val API_BASE_PATH = "/api"
  }

  @Bean
  fun httpClient(): HttpClient {
    return HttpClientBuilder.create()
      .setUserAgent("Mozilla/5.0 (X11; Linux x86_64; rv:58.0) Gecko/20100101 Firefox/58.0")
      .build()
  }

  @Bean
  fun httpComponentsClientHttpRequestFactory(httpClient: HttpClient) =
    HttpComponentsClientHttpRequestFactory(httpClient)

  @Bean
  fun requestFactory(clientHttpRequestFactory: HttpComponentsClientHttpRequestFactory) =
    BufferingClientHttpRequestFactory(clientHttpRequestFactory)

  @Bean
  @Primary
  fun getRestClient(requestFactory: BufferingClientHttpRequestFactory): RestTemplate {
    val restClient = RestTemplate(requestFactory)
    restClient.errorHandler = ExternalProviderErrorHandler()
    restClient.interceptors.add(OutgoingLoggingInterceptor())
    return restClient
  }

  @Bean
  fun getHttpEntityWithJsonAcceptHeader(): HttpEntity<Void> {
    val httpHeaders = HttpHeaders()
    httpHeaders.accept = listOf(MediaType.APPLICATION_JSON_UTF8)
    httpHeaders["User-Agent"] =
      listOf("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36")
    return HttpEntity(httpHeaders)
  }

  @Bean
  fun corsConfigurer(properties: Properties): WebMvcConfigurer {
    return object : WebMvcConfigurer {
      override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/graphql")
          .allowedOrigins(properties.baseUrl.frontend, properties.baseUrl.api)
          .allowedMethods("GET", "POST", "HEAD")
          .allowCredentials(false)
        registry.addMapping("${CalendarController.PATH}/**")
          .allowedOrigins(properties.baseUrl.frontend, properties.baseUrl.api)
          .allowedMethods("GET", "HEAD")
          .allowCredentials(false)
      }
    }
  }

  @Bean
  @Transactional
  fun seedInitialData(
    dataLoader: DataLoader,
    mongoMigrator: MongoMigrator,
    properties: Properties
  ) = ApplicationRunner { _ ->
    if (!properties.enableSeeding) {
      log.info("Seeding not enabled, ignoring...")
      return@ApplicationRunner
    }

    log.info("Reassignment enabled=${properties.enableReassignment}")

    if (!properties.tmdb.apiKeyExists()) {
      log.warn("TMDB api key not set. Some features will not work properly!")
    }

    dataLoader.seedInitialData()

    val before = System.currentTimeMillis()
    mongoMigrator.migrateLocationsFromMongo()
    mongoMigrator.migrateUsersFromMongo()
    mongoMigrator.migrateMoviesFromMongo()
    mongoMigrator.migrateShowingsFromMongo()
    mongoMigrator.migrateTicketsFromMongo()
    val duration = System.currentTimeMillis() - before
    log.info("Data migration complete in {} ms", duration)
  }

  @Bean
  fun graphqlExecutionStrategy(graphqlExceptionHandler: GraphqlExceptionHandler) =
    AsyncExecutionStrategy(graphqlExceptionHandler)

  @Bean
  fun graphQLServletObjectMapperConfigurer(): ObjectMapperConfigurer {
    return ObjectMapperConfigurer {
      it.findAndRegisterModules()
        .registerModule(JavaTimeModule())
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
    }
  }

  @Bean
  fun graphQLToolsObjectMapperConfig(): com.coxautodev.graphql.tools.ObjectMapperConfigurer {
    return com.coxautodev.graphql.tools.ObjectMapperConfigurer { mapper, _ ->
      mapper.findAndRegisterModules()
        .registerModule(JavaTimeModule())
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
    }
  }

  @ExperimentalCoroutinesApi
  @Bean
  fun schemaParserOptions(objConfigurer: com.coxautodev.graphql.tools.ObjectMapperConfigurer) = SchemaParserOptions
    .newOptions()
    .objectMapperConfigurer(objConfigurer)
    .build()

  @Bean
  fun schemaDictionary() = SchemaParserDictionary()
    .add(MailSettings::class)
    .add(PushoverSettings::class)
}

fun main(args: Array<String>) {
  runApplication<Application>(*args)
}
