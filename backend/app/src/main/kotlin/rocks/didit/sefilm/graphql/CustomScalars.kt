package rocks.didit.sefilm.graphql

import graphql.language.IntValue
import graphql.language.StringValue
import graphql.schema.Coercing
import graphql.schema.GraphQLScalarType
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.id.Base64ID
import rocks.didit.sefilm.domain.id.GoogleId
import rocks.didit.sefilm.domain.id.IMDbID
import rocks.didit.sefilm.domain.id.MovieID
import rocks.didit.sefilm.domain.id.TMDbID
import java.time.LocalDate
import java.time.LocalTime
import java.util.*

@Configuration
class CustomScalars {
  @Bean
  fun customScalarUUID(): GraphQLScalarType {
    return GraphQLScalarType.newScalar()
      .name("UUID")
      .description("UUID")
      .coercing(object : Coercing<UUID, String> {
        override fun parseLiteral(input: Any?): UUID {
          return when (input) {
            is StringValue -> UUID.fromString(input.value)
            is String -> UUID.fromString(input)
            else -> throw IllegalArgumentException("Unable to parse UUID from $input")
          }
        }

        override fun parseValue(input: Any?): UUID = parseLiteral(input)

        override fun serialize(dataFetcherResult: Any?): String? = when (dataFetcherResult) {
          is String -> dataFetcherResult
          is UUID -> dataFetcherResult.toString()
          else -> null
        }
      })
      .build()
  }

  @Bean
  fun customScalarMovieId(): GraphQLScalarType {
    return GraphQLScalarType.newScalar()
      .name("MovieID")
      .description("Movie ID")
      .coercing(object : Coercing<MovieID, String> {
        override fun parseLiteral(input: Any?): MovieID {
          return when (input) {
            is StringValue -> MovieID(UUID.fromString(input.value))
            is String -> MovieID(UUID.fromString(input))
            else -> throw IllegalArgumentException("Unable to parse MovieID from $input")
          }
        }

        override fun parseValue(input: Any?): MovieID = parseLiteral(input)

        override fun serialize(dataFetcherResult: Any?): String? = when (dataFetcherResult) {
          is String -> dataFetcherResult
          is MovieID -> dataFetcherResult.toString()
          else -> null
        }
      })
      .build()
  }

  @Bean
  fun customScalarBase64ID(): GraphQLScalarType = GraphQLScalarType.newScalar()
    .name("Base64ID")
    .description("Base64ID")
    .coercing(object : Coercing<Base64ID, String> {
      override fun parseLiteral(input: Any?): Base64ID {
        return when (input) {
          is StringValue -> Base64ID(input.value)
          is String -> Base64ID(input)
          else -> throw IllegalArgumentException("Unable to parse Base64ID from $input")
        }
      }

      override fun parseValue(input: Any?): Base64ID = parseLiteral(input)

      override fun serialize(input: Any?): String? = when (input) {
        is String -> input
        is Base64ID -> input.id
        else -> null
      }
    }).build()

  @Bean
  fun customScalarSEK(): GraphQLScalarType = GraphQLScalarType.newScalar()
    .name("SEK")
    .description("Swedish Kronor")
    .coercing(object : Coercing<SEK, Long> {
      override fun parseLiteral(input: Any?): SEK? {
        return when (input) {
          is Long -> SEK(input)
          is IntValue -> SEK(input.value.toLong())
          is Int -> SEK(input.toLong())
          else -> null
        }
      }

      override fun parseValue(input: Any?): SEK? = parseLiteral(input)

      override fun serialize(dataFetcherResult: Any?): Long? = when (dataFetcherResult) {
        is Long -> dataFetcherResult
        is SEK -> dataFetcherResult.toÖren()
        else -> null
      }
    }).build()

  @Bean
  fun customScalarLocalDate(): GraphQLScalarType = GraphQLScalarType.newScalar()
    .name("LocalDate")
    .description("Simple LocalDate, i.e. 2017-12-01")
    .coercing(object : Coercing<LocalDate, String> {
      override fun parseLiteral(input: Any?): LocalDate? {
        return when (input) {
          is StringValue -> LocalDate.parse(input.value)
          is String -> LocalDate.parse(input)
          else -> null
        }
      }

      override fun parseValue(input: Any?): LocalDate? = parseLiteral(input)

      override fun serialize(dataFetcherResult: Any?): String? = when (dataFetcherResult) {
        is String -> dataFetcherResult
        is LocalDate -> dataFetcherResult.toString()
        else -> null
      }
    }).build()

  @Bean
  fun customScalarLocalTime(): GraphQLScalarType =
    GraphQLScalarType.newScalar()
      .name("LocalTime")
      .description("Simple LocalTime, i.e. 19:37:21")
      .coercing(object : Coercing<LocalTime, String> {
        override fun parseLiteral(input: Any?): LocalTime? {
          return when (input) {
            is StringValue -> LocalTime.parse(input.value)
            is String -> LocalTime.parse(input)
            else -> null
          }
        }

        override fun parseValue(input: Any?): LocalTime? = parseLiteral(input)

        override fun serialize(dataFetcherResult: Any?): String? = when (dataFetcherResult) {
          is String -> dataFetcherResult
          is LocalTime -> dataFetcherResult.toString()
          else -> null
        }
      }).build()

  @Bean
  fun customScalarIMDbID(): GraphQLScalarType = GraphQLScalarType.newScalar()
    .name("IMDbID")
    .description("IMDb ID, i.e. tt2527336")
    .coercing(object : Coercing<IMDbID, String> {
      override fun parseLiteral(input: Any?): IMDbID {
        return when (input) {
          is StringValue -> IMDbID.valueOf(input.value)
          is String -> IMDbID.valueOf(input)
          else -> IMDbID.MISSING
        }
      }

      override fun parseValue(input: Any?): IMDbID = parseLiteral(input)

      override fun serialize(input: Any?): String? = when (input) {
        is String -> input
        is IMDbID -> input.value
        else -> null
      }
    }).build()

  @Bean
  fun customScalarTMDbID(): GraphQLScalarType = GraphQLScalarType.newScalar()
    .name("TMDbID")
    .description("TMDb ID")
    .coercing(object : Coercing<TMDbID, Long> {
      override fun parseLiteral(input: Any?): TMDbID {
        return when (input) {
          is IntValue -> TMDbID.valueOf(input.value.toLong())
          is Int -> TMDbID.valueOf(input.toLong())
          else -> TMDbID.MISSING
        }
      }

      override fun parseValue(input: Any?): TMDbID = parseLiteral(input)

      override fun serialize(input: Any?): Long? = when (input) {
        is Long -> input
        is TMDbID -> input.value
        else -> null
      }
    }).build()

  @Bean
  fun customScalarUserID(): GraphQLScalarType = GraphQLScalarType.newScalar()
    .name("UserID")
    .description("UserID")
    .coercing(object : Coercing<GoogleId, String> {
      override fun parseLiteral(input: Any?): GoogleId {
        return when (input) {
          is StringValue -> GoogleId(input.value)
          is String -> GoogleId(input)
          else -> throw IllegalArgumentException("Unablet to convert '$input' to a UserID")
        }
      }

      override fun parseValue(input: Any?): GoogleId = parseLiteral(input)

      override fun serialize(input: Any?): String? = when (input) {
        is String -> input
        is GoogleId -> input.id
        else -> null
      }
    }).build()
}
