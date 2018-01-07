package rocks.didit.sefilm.graphql

import com.coxautodev.graphql.tools.GraphQLQueryResolver
import org.springframework.stereotype.Component
import rocks.didit.sefilm.notification.providers.NotificationProvider
import rocks.didit.sefilm.notification.providers.NotificationProviderDTO

@Suppress("unused")
@Component
class NotificationResolvers(private val notificationProviders: List<NotificationProvider>) : GraphQLQueryResolver {

  fun allNotificationProviders(): List<NotificationProviderDTO>
    = notificationProviders
    .filter { it.isSubscribable }
    .map { NotificationProviderDTO.from(it) }
}