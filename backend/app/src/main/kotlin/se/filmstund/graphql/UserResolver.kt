@file:Suppress("unused")

package se.filmstund.graphql

import com.coxautodev.graphql.tools.GraphQLQueryResolver
import com.coxautodev.graphql.tools.GraphQLResolver
import org.springframework.stereotype.Component
import se.filmstund.Properties
import se.filmstund.domain.dto.core.UserDTO
import se.filmstund.services.GiftCertificateService
import se.filmstund.services.UserService
import se.filmstund.web.controllers.CalendarController

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
