package rocks.didit.sefilm.graphql

import graphql.ErrorType
import graphql.ExceptionWhileDataFetching
import graphql.GraphQLError
import graphql.execution.DataFetcherExceptionHandler
import graphql.execution.DataFetcherExceptionHandlerParameters
import graphql.language.SourceLocation
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import rocks.didit.sefilm.KnownException

@Component
class GraphqlExceptionHandler : DataFetcherExceptionHandler {
  private val log: Logger = LoggerFactory.getLogger(GraphqlExceptionHandler::class.java)

  override fun accept(handlerParameters: DataFetcherExceptionHandlerParameters) {
    val exception = handlerParameters.exception
    val sourceLocation = handlerParameters.field.sourceLocation
    val path = handlerParameters.path

    val graphqlError = when (exception) {
      is KnownException -> object : GraphQLError {
        override fun getMessage(): String = exception.message ?: ""
        override fun getErrorType(): ErrorType = ErrorType.DataFetchingException
        override fun getLocations(): List<SourceLocation> = listOf()
        override fun getExtensions(): Map<String, Any?>
          = mapOf("offendingUser" to exception.whichUser,
          "showing" to exception.whichShowing)
      }
      else -> {
        log.warn("Exception during data fetching: ${exception.message}", exception)
        ExceptionWhileDataFetching(path, exception, sourceLocation)
      }
    }
    handlerParameters.executionContext.addError(graphqlError, path)

  }
}
