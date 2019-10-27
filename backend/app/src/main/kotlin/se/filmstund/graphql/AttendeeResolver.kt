@file:Suppress("unused")

package se.filmstund.graphql

import com.coxautodev.graphql.tools.GraphQLResolver
import org.springframework.stereotype.Component
import se.filmstund.domain.dto.core.AttendeeDTO
import se.filmstund.services.UserService

@Component
class AttendeeResolver(
  private val userService: UserService
) : GraphQLResolver<AttendeeDTO> {
  fun user(attendee: AttendeeDTO) = userService.getUserOrThrow(attendee.userId)
}
