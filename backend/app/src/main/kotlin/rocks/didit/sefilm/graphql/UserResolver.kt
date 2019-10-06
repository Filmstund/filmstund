@file:Suppress("unused")

package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLQueryResolver
import com.coxautodev.graphql.tools.GraphQLResolver
import org.springframework.stereotype.Component
import rocks.didit.sefilm.Properties
import rocks.didit.sefilm.domain.dto.core.UserDTO
import rocks.didit.sefilm.services.UserService
import rocks.didit.sefilm.web.controllers.CalendarController

@Component
class UserResolver(private val userService: UserService) : GraphQLQueryResolver {
  fun allUsers() = userService.allUsers()
  /** The currently logged in user */
  fun currentUser() = userService.getCurrentUser()
}

@Component
class CalendarFeedResolver(private val properties: Properties) : GraphQLResolver<UserDTO> {
  fun calendarFeedUrl(user: UserDTO): String? {
    if (user.calendarFeedId == null) {
      return null
    }
    return "${properties.baseUrl.api}${CalendarController.PATH}/${user.calendarFeedId}"
  }
}
