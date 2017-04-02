package rocks.didit.sefilm.web

import org.springframework.context.annotation.Bean
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.server.router
import rocks.didit.sefilm.web.handlers.LocationHandler
import rocks.didit.sefilm.web.handlers.MovieHandler
import rocks.didit.sefilm.web.handlers.ShowingHandler
import rocks.didit.sefilm.web.handlers.UserHandler

@Component
class ApiRoutes(val movieHandler: MovieHandler, val showingHandler: ShowingHandler, val userHandler: UserHandler,
                val locationHandler: LocationHandler) {
    @Bean
    fun apiRouter() = router {
        (accept(MediaType.APPLICATION_JSON) and "/api").nest {
            "/movies".nest {
                GET("/", movieHandler::findAll)
                PUT("/", movieHandler::saveMovie)
                GET("/sf", movieHandler::populateFromSf)
                GET("/{id}", movieHandler::findOne)
                //POST("/{id}", movieHandler::updateMovie)
            }

            "/showings".nest {
                GET("/", showingHandler::findAll)
                GET("/{id}", showingHandler::findOne)
                GET("/{id}/bioklubbnummer", showingHandler::findBioklubbnummerForShowing)
            }

            "/users".nest {
                GET("/", userHandler::findAll)
                GET("/{id}", userHandler::findOne)
            }

            "/locations".nest {
                GET("/", locationHandler::findAll)
                GET("/{name}", locationHandler::findOne)
            }
        }
    }
}
