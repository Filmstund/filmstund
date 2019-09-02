package rocks.didit.sefilm.configuration

import org.springframework.data.domain.AuditorAware
import org.springframework.stereotype.Component
import rocks.didit.sefilm.database.mongo.entities.User
import rocks.didit.sefilm.services.UserService
import java.util.*

@Component
class UserAuditorAware(private val userService: UserService) : AuditorAware<User> {
  override fun getCurrentAuditor() = Optional.ofNullable(userService.currentUserOrNull())
}