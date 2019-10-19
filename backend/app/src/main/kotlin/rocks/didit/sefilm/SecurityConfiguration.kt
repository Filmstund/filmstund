package rocks.didit.sefilm

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.inTransactionUnchecked
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter
import org.springframework.security.oauth2.config.annotation.web.configurers.ResourceServerSecurityConfigurer
import org.springframework.security.oauth2.provider.token.AccessTokenConverter
import org.springframework.security.oauth2.provider.token.DefaultAccessTokenConverter
import org.springframework.security.oauth2.provider.token.UserAuthenticationConverter
import org.springframework.security.oauth2.provider.token.store.jwk.JwkTokenStore
import org.springframework.stereotype.Component
import rocks.didit.sefilm.database.dao.UserDao
import rocks.didit.sefilm.domain.GoogleId
import rocks.didit.sefilm.domain.dto.PublicUserDTO
import rocks.didit.sefilm.domain.dto.core.UserDTO
import rocks.didit.sefilm.web.controllers.CalendarController
import rocks.didit.sefilm.web.controllers.MetaController
import java.time.Instant
import java.util.*

class OpenIdConnectUserDetails(userInfo: Map<String, *>) : UserDetails {

  val userId: String = userInfo["sub"] as String
  private val username: String? = userInfo["email"] as String
  val firstName: String? = userInfo["given_name"] as String
  val lastName: String? = userInfo["family_name"] as String
  val avatarUrl: String? = userInfo["picture"] as String
  val name: String? get() = "$firstName $lastName"

  override fun getUsername(): String? = username
  override fun getAuthorities() = listOf(SimpleGrantedAuthority("ROLE_USER"))
  override fun getPassword(): String? = null
  override fun isAccountNonExpired(): Boolean = true
  override fun isAccountNonLocked(): Boolean = true
  override fun isCredentialsNonExpired(): Boolean = true
  override fun isEnabled(): Boolean = true

  override fun toString(): String {
    return "OpenIdConnectUserDetails(userId='$userId', username=$username, firstName=$firstName, lastName=$lastName, avatarUrl=$avatarUrl)"
  }
}

@Component
class UserAuthConverter(
  private val jdbi: Jdbi
) : UserAuthenticationConverter {
  private val log by logger()

  override fun extractAuthentication(map: Map<String, *>): Authentication? {
    return jdbi.inTransactionUnchecked {
      val userDao = it.attach(UserDao::class.java)
      val details = OpenIdConnectUserDetails(map)

      val principal: PublicUserDTO = when (userDao.existsByGoogleId(details.userId)) {
        true -> onExistingUser(userDao, details)
        false -> onNewUser(userDao, details)
      }

      UsernamePasswordAuthenticationToken(principal, "N/A", details.authorities)
    }
  }

  fun onExistingUser(userDao: UserDao, details: OpenIdConnectUserDetails): PublicUserDTO {
    val user = userDao.findPublicUserByGoogleId(GoogleId(details.userId)) ?: throw NotFoundException("user")
    val firstName = details.firstName ?: "Mr Noname"
    val lastName = details.lastName ?: "Anybody"

    userDao.updateUserOnLogin(user.id, firstName, lastName, details.avatarUrl)
    return user.copy(firstName = firstName, lastName = lastName, avatar = details.avatarUrl)
  }

  fun onNewUser(userDao: UserDao, details: OpenIdConnectUserDetails): PublicUserDTO {
    val newUser = UserDTO(
      id = UUID.randomUUID(),
      googleId = GoogleId(details.userId),
      calendarFeedId = UUID.randomUUID(),
      firstName = details.firstName ?: "Bosse",
      lastName = details.lastName ?: "Ringholm",
      nick = details.firstName ?: "Houdini",
      email = details.username ?: "",
      avatar = details.avatarUrl,
      lastLogin = Instant.now(),
      signupDate = Instant.now(),
      lastModifiedDate = Instant.now()
    )

    userDao.insertUser(newUser)
    log.info("Created new Google user ${newUser.name} (${newUser.id})")
    return newUser.toPublicUserDTO()
  }

  override fun convertUserAuthentication(userAuthentication: Authentication) =
    throw UnsupportedOperationException("This operation is not supported")
}

@Configuration
@EnableWebSecurity
@EnableResourceServer
class ResourceServerConfig(
  private val properties: Properties
) : ResourceServerConfigurerAdapter() {

  override fun configure(resources: ResourceServerSecurityConfigurer) {
    resources
      .resourceId(properties.google.clientId)
      .stateless(true)
  }

  override fun configure(http: HttpSecurity) {
    http
      .cors().and()
      .antMatcher("/**")
      .authorizeRequests()
      .antMatchers(HttpMethod.OPTIONS, "/graphql").permitAll()
      .antMatchers(HttpMethod.GET, "/info").permitAll()
      .antMatchers(HttpMethod.GET, "/health").permitAll()
      .antMatchers(HttpMethod.GET, "${CalendarController.PATH}/**").permitAll()
      .antMatchers(HttpMethod.HEAD, "${CalendarController.PATH}/**").permitAll()
      .antMatchers(HttpMethod.OPTIONS, "${CalendarController.PATH}/**").permitAll()
      .antMatchers(HttpMethod.GET, "${MetaController.PATH}/**").permitAll()
      .anyRequest().fullyAuthenticated()
  }

  @Bean
  fun jwkTokenStore(accessTokenConverter: AccessTokenConverter): JwkTokenStore {
    return JwkTokenStore(properties.google.jwkUri, accessTokenConverter)
  }

  @Bean
  fun accessTokenConverter(userAuthenticationConverter: UserAuthenticationConverter): AccessTokenConverter {
    val default = DefaultAccessTokenConverter()
    default.setUserTokenConverter(userAuthenticationConverter)
    return default
  }
}
