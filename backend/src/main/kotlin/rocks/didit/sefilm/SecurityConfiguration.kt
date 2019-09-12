package rocks.didit.sefilm

import org.springframework.context.ApplicationListener
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.authentication.event.AuthenticationSuccessEvent
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
import org.springframework.transaction.annotation.Transactional
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.database.entities.UserIds
import rocks.didit.sefilm.database.repositories.UserIdsRepository
import rocks.didit.sefilm.domain.UserID
import rocks.didit.sefilm.web.controllers.CalendarController
import rocks.didit.sefilm.web.controllers.MetaController
import java.time.Instant

class OpenIdConnectUserDetails(userInfo: Map<String, *>) : UserDetails {

  val userId: String = userInfo.getValue("sub") as String
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

class OpenidUserAuthConverter : UserAuthenticationConverter {
  override fun extractAuthentication(map: Map<String, *>): Authentication? {
    val user = OpenIdConnectUserDetails(map)
    return UsernamePasswordAuthenticationToken(user, "N/A", user.authorities)
  }

  override fun convertUserAuthentication(userAuthentication: Authentication) =
    throw UnsupportedOperationException("This operation is not supported")
}

@Component
class LoginListener(
  private val userIdsRepo: UserIdsRepository
) : ApplicationListener<AuthenticationSuccessEvent> {
  private val log by logger()

  @Transactional
  override fun onApplicationEvent(event: AuthenticationSuccessEvent) {
    createOrUpdateUser(event.authentication)
  }

  private fun createOrUpdateUser(authentication: Authentication) {
    val principal = authentication.principal as OpenIdConnectUserDetails?
      ?: throw IllegalStateException("Successful authentication without a principal")

    val maybeUser: UserIds? = userIdsRepo.findByGoogleId(UserID(principal.userId))
    if (maybeUser == null) {
      log.info("New user")
      val newUser = User(
        firstName = principal.firstName ?: "Bosse",
        lastName = principal.lastName ?: "Ringholm",
        nick = principal.firstName ?: "Houdini",
        email = principal.username ?: "",
        avatar = principal.avatarUrl,
        lastLogin = Instant.now(),
        signupDate = Instant.now()
      )
      userIdsRepo.save(UserIds(id = newUser.id, user = newUser, googleId = UserID(principal.userId)))
      log.info("Created new user ${newUser.name} (${newUser.id})")
    } else {
      maybeUser.user.firstName = principal.firstName ?: "Mr Noname"
      maybeUser.user.lastName = principal.lastName ?: "Anybody"
      maybeUser.user.avatar = principal.avatarUrl
      maybeUser.user.lastLogin = Instant.now()
    }
  }
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

  @Bean
  fun userAuthenticationConverter() = OpenidUserAuthConverter()
}
