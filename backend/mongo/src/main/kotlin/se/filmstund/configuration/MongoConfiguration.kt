package se.filmstund.configuration

import org.springframework.boot.ApplicationRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.mongodb.config.EnableMongoAuditing
import org.springframework.data.mongodb.core.convert.MongoCustomConversions
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories
import org.springframework.transaction.annotation.Transactional
import se.filmstund.database.mongo.ImdbIdConverter
import se.filmstund.database.mongo.MongoMigrator
import se.filmstund.database.mongo.TmdbIdConverter
import se.filmstund.logger

@Configuration
@EnableMongoAuditing
@EnableMongoRepositories(basePackages = ["se.filmstund.database.mongo.repositories"])
class MongoConfiguration {

  private val log by logger()

  @Bean
  fun customMongoConverters(): MongoCustomConversions {
    val converters = listOf(
      ImdbIdConverter(),
      TmdbIdConverter()
    )
    return MongoCustomConversions(converters)
  }

  @Bean
  @Transactional
  internal fun migrateMongo(
    mongoMigrator: MongoMigrator
  ) = ApplicationRunner { _ ->
    val before = System.currentTimeMillis()
    mongoMigrator.migrateLocationsFromMongo()
    mongoMigrator.migrateUsersFromMongo()
    mongoMigrator.migrateMoviesFromMongo()
    mongoMigrator.migrateShowingsFromMongo()
    mongoMigrator.migrateTicketsFromMongo()
    val duration = System.currentTimeMillis() - before
    log.info("Data migration complete in {} ms", duration)
  }
}