package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLQueryResolver
import org.springframework.stereotype.Component
import rocks.didit.sefilm.services.UserService

@Component
class UserResolver(private val userService: UserService) : GraphQLQueryResolver {
  fun allUsers() = userService.allUsers()
  /** The currently logged in user */
  fun currentUser() = userService.currentUser()
}