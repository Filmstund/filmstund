package rocks.didit.sefilm

import com.coxautodev.graphql.tools.SchemaParserDictionary
import com.coxautodev.graphql.tools.SchemaParserOptions
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.readValue
import graphql.execution.AsyncExecutionStrategy
import graphql.servlet.ObjectMapperConfigurer
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
import org.springframework.core.io.ClassPathResource
import org.springframework.data.mongodb.core.convert.MongoCustomConversions
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder
import org.springframework.scheduling.annotation.EnableAsync
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
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
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.domain.Base64ID
import rocks.didit.sefilm.domain.ExternalProviderErrorHandler
import rocks.didit.sefilm.graphql.GraphqlExceptionHandler
import rocks.didit.sefilm.notification.MailSettings
import rocks.didit.sefilm.notification.PushoverSettings
import rocks.didit.sefilm.services.SlugService
import rocks.didit.sefilm.services.external.FilmstadenService
import rocks.didit.sefilm.utils.MovieFilterUtil
import rocks.didit.sefilm.web.controllers.CalendarController
import java.math.BigDecimal

@SpringBootApplication
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
    fun customMongoConverters(): MongoCustomConversions {
        val converters = listOf(ImdbIdConverter(), TmdbIdConverter())
        return MongoCustomConversions(converters)
    }

    @Bean
    fun httpClient(): HttpClient {
        return HttpClientBuilder.create()
                .setUserAgent("Mozilla/5.0 (X11; Linux x86_64; rv:58.0) Gecko/20100101 Firefox/58.0")
                .build()
    }

    @Bean
    fun httpRequestFactory(httpClient: HttpClient) = HttpComponentsClientHttpRequestFactory(httpClient)

    @Bean
    @Primary
    fun getRestClient(requestFactory: HttpComponentsClientHttpRequestFactory): RestTemplate {
        val restClient = RestTemplate(requestFactory)
        restClient.errorHandler = ExternalProviderErrorHandler()
        return restClient
    }

    @Bean
    fun getHttpEntityWithJsonAcceptHeader(): HttpEntity<Void> {
        val httpHeaders = HttpHeaders()
        httpHeaders.accept = listOf(MediaType.APPLICATION_JSON_UTF8)
        httpHeaders["User-Agent"] = listOf("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36")
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
    fun removeUnwantedMovies(movieRepository: MovieRepository, titleExtensions: MovieFilterUtil) = ApplicationRunner { _ ->
        val unwantedMovies = movieRepository
                .findAll()
                .filter { titleExtensions.isMovieUnwantedBasedOnGenre(it.genres) || titleExtensions.isTitleUnwanted(it.title) }
        log.info("Deleting ${unwantedMovies.size} unwanted movies")
        movieRepository.deleteAll(unwantedMovies)
    }

    @Bean
    fun createSlugsAndWebIds(showingRepository: ShowingRepository, slugService: SlugService) = ApplicationRunner { _ ->
        val showingsWithMissingWebId = showingRepository
                .findAll()
                .filter {
                    it.webId == Base64ID.MISSING
                }

        val updatedShowings = showingsWithMissingWebId.map {
            it.copy(webId = Base64ID.random(), slug = slugService.generateSlugFor(it))
        }
        showingRepository.saveAll(updatedShowings)
    }

    @Bean
    fun trimMovieNames(movieRepository: MovieRepository, titleExtensions: MovieFilterUtil) = ApplicationRunner { _ ->
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

    private data class LocationAliasDTO(val filmstadenId: String, val alias: List<String>)

    @Bean
    fun seedInitialData(
            locationsRepo: LocationRepository,
            budordRepo: BudordRepository,
            filmstadenService: FilmstadenService,
            properties: Properties
    ) = ApplicationRunner { _ ->
        if (!properties.enableSeeding) {
            log.info("Seeding not enabled, ignoring...")
            return@ApplicationRunner
        }
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

        val locationNameAliasResource = ClassPathResource("seeds/filmstaden-location-aliases.json")
        val locationNameAlias: List<LocationAliasDTO> = objectMapper.readValue(locationNameAliasResource.inputStream)

        val defaultCity = properties.defaultCity
        val locationsFromFilmstaden = filmstadenService.getLocationsInCity(properties.defaultCity)
                .map {
                    Location(
                            it.title,
                            it.address.city["alias"],
                            it.address.city["name"],
                            it.address.streetAddress,
                            it.address.postalCode,
                            it.address.postalAddress,
                            BigDecimal(it.address.coordinates.latitude),
                            BigDecimal(it.address.coordinates.longitude),
                            it.ncgId,
                            alias = locationNameAlias.firstOrNull { alias -> alias.filmstadenId == it.ncgId }?.alias
                                    ?: listOf()
                    )
                }

        locationsRepo.saveAll(locations)
        log.info("Seeded locations with ${locations.size} values")

        log.info("Seeded ${locationsRepo.saveAll(locationsFromFilmstaden).count()} locations from Filmstaden for city: $defaultCity")
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
