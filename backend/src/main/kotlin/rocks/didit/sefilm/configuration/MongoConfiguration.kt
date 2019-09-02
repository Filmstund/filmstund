package rocks.didit.sefilm.configuration

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.mongodb.config.EnableMongoAuditing
import org.springframework.data.mongodb.core.convert.MongoCustomConversions
import rocks.didit.sefilm.database.mongo.ImdbIdConverter
import rocks.didit.sefilm.database.mongo.TmdbIdConverter

@Configuration
@EnableMongoAuditing
class MongoConfiguration {

  @Bean
  fun customMongoConverters(): MongoCustomConversions {
    val converters = listOf(
      ImdbIdConverter(),
      TmdbIdConverter()
    )
    return MongoCustomConversions(converters)
  }
}