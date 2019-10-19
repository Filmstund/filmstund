@file:Suppress("unused")

package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLQueryResolver
import com.coxautodev.graphql.tools.GraphQLResolver
import org.springframework.stereotype.Component
import rocks.didit.sefilm.Properties
import rocks.didit.sefilm.domain.dto.core.UserDTO
import rocks.didit.sefilm.services.GiftCertificateService
import rocks.didit.sefilm.services.UserService
import rocks.didit.sefilm.web.controllers.CalendarController

@Component
class UserResolver(
  private val userService: UserService,
  private val giftCertificateService: GiftCertificateService
) : GraphQLQueryResolver {

  fun allUsers() = userService.allUsers()
  fun currentUser(): UserDTO {
    val currentUser = userService.getCurrentUser()

    val giftCertsWithStatus = currentUser.giftCertificates.map { gc ->
      gc.copy(status = giftCertificateService.getStatusOfTicket(gc))
    }
    return currentUser.copy(giftCertificates = giftCertsWithStatus)
  }
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
