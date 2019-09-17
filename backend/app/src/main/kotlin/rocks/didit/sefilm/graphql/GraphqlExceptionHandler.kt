package rocks.didit.sefilm.graphql

import graphql.ErrorType
import graphql.ExceptionWhileDataFetching
import graphql.GraphQLError
import graphql.execution.DataFetcherExceptionHandler
import graphql.execution.DataFetcherExceptionHandlerParameters
import graphql.execution.DataFetcherExceptionHandlerResult
import graphql.language.SourceLocation
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Component
import rocks.didit.sefilm.KnownException

@Component
class GraphqlExceptionHandler : DataFetcherExceptionHandler {
  private val log: Logger = LoggerFactory.getLogger(GraphqlExceptionHandler::class.java)

  override fun onException(handlerParameters: DataFetcherExceptionHandlerParameters): DataFetcherExceptionHandlerResult {
    val exception = handlerParameters.exception
    val sourceLocation = handlerParameters.sourceLocation
    val path = handlerParameters.path

    val graphqlError = when (exception) {
      is KnownException -> createFetchingError(
        exception.message ?: "",
        mapOf("offendingUser" to exception.whichUser, "showing" to exception.whichShowing)
      )
      is IllegalArgumentException -> createFetchingError(exception.message ?: "")
      is AccessDeniedException -> createFetchingError(exception.message ?: "")
      else -> {
        log.warn("Exception during data fetching: ${exception.message}", exception)
        ExceptionWhileDataFetching(path, exception, sourceLocation)
      }
    }
    return DataFetcherExceptionHandlerResult.Builder()
      .error(graphqlError)
      .build()
  }

  private fun createFetchingError(msg: String, extensions: Map<String, Any?> = mapOf()): GraphQLError {
    return object : GraphQLError {
      override fun getMessage(): String = msg
      override fun getErrorType(): ErrorType = ErrorType.DataFetchingException
      override fun getLocations(): List<SourceLocation> = listOf()
      override fun getExtensions(): Map<String, Any?> = extensions
    }
  }
}
