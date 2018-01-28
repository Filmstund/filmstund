package rocks.didit.sefilm.graphql

import graphql.language.IntValue
import graphql.language.StringValue
import graphql.schema.Coercing
import graphql.schema.GraphQLScalarType
import org.springframework.stereotype.Component
import rocks.didit.sefilm.domain.IMDbID
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.TMDbID
import rocks.didit.sefilm.domain.UserID
import java.time.LocalDate
import java.time.LocalTime
import java.util.*

@Component
class CustomScalarUUID : GraphQLScalarType("UUID", "UUID", object : Coercing<UUID, String> {
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

@Component
class CustomScalarSEK : GraphQLScalarType("SEK", "Swedish Kronor", object : Coercing<SEK, Long> {
  override fun parseLiteral(input: Any?): SEK? {
    return when (input) {
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
})

@Component
class CustomScalarLocalDate :
  GraphQLScalarType("LocalDate", "Simple LocalDate, i.e. 2017-12-01", object : Coercing<LocalDate, String> {
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
  })

@Component
class CustomScalarLocalTime :
  GraphQLScalarType("LocalTime", "Simple LocalTime, i.e. 19:37:21", object : Coercing<LocalTime, String> {
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
  })

@Component
class CustomScalarIMDbID : GraphQLScalarType("IMDbID", "IMDb ID, i.e. tt2527336", object : Coercing<IMDbID, String> {
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
})

@Component
class CustomScalarTMDbID : GraphQLScalarType("TMDbID", "TMDb ID", object : Coercing<TMDbID, Long> {
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
})

@Component
class CustomScalarUserID : GraphQLScalarType("UserID", "UserID", object : Coercing<UserID, String> {
  override fun parseLiteral(input: Any?): UserID {
    return when (input) {
      is StringValue -> UserID(input.value)
      is String -> UserID(input)
      else -> throw IllegalArgumentException("Unablet to convert '$input' to a UserID")
    }
  }

  override fun parseValue(input: Any?): UserID = parseLiteral(input)

  override fun serialize(input: Any?): String? = when (input) {
    is String -> input
    is UserID -> input.id
    else -> null
  }
})
