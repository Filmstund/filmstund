package rocks.didit.sefilm.graphql

import graphql.language.IntValue
import graphql.language.StringValue
import graphql.schema.Coercing
import graphql.schema.GraphQLScalarType
import org.springframework.stereotype.Component
import rocks.didit.sefilm.domain.IMDbID
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.TMDbID
import java.time.LocalDate
import java.util.*

@Component
class CustomScalarUUID : GraphQLScalarType("UUID", "UUID", object : Coercing<UUID, String> {
  override fun parseLiteral(input: Any?): UUID? {
    return when (input) {
      is StringValue -> UUID.fromString(input.value)
      else -> null
    }
  }

  override fun parseValue(input: Any?): UUID? = parseLiteral(input)

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
class CustomScalarLocalDate : GraphQLScalarType("LocalDate", "Simple LocalDate, i.e. 2017-12-01", object : Coercing<LocalDate, String> {
  override fun parseLiteral(input: Any?): LocalDate? {
    return when (input) {
      is StringValue -> LocalDate.parse(input.value)
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
class CustomScalarIMDbID : GraphQLScalarType("IMDbID", "IMDb ID, i.e. tt2527336", object : Coercing<IMDbID, String> {
  override fun parseLiteral(input: Any?): IMDbID {
    return when (input) {
      is StringValue -> IMDbID.valueOf(input.value)
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
