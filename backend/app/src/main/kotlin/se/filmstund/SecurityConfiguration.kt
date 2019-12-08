package se.filmstund

import com.github.benmanes.caffeine.cache.Cache
import com.github.benmanes.caffeine.cache.Caffeine
import com.github.benmanes.caffeine.cache.Expiry
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
import se.filmstund.database.dao.UserDao
import se.filmstund.domain.Nick
import se.filmstund.domain.dto.core.PublicUserDTO
import se.filmstund.domain.dto.core.UserDTO
import se.filmstund.domain.id.CalendarFeedID
import se.filmstund.domain.id.GoogleId
import se.filmstund.domain.id.UserID
import se.filmstund.web.controllers.CalendarController
import se.filmstund.web.controllers.MetaController
import java.time.Duration
import java.time.Instant

class OpenIdConnectUserDetails(jwt: Map<String, *>) : UserDetails {

  val issuer: String = jwt["iss"] as String
  val authorizedParty: String = jwt["azp"] as String
  val audience: String = jwt["aud"] as String
  val subject: String = jwt["sub"] as String
  private val username: String? = jwt["email"] as String
  val firstName: String? = jwt["given_name"] as String
  val lastName: String? = jwt["family_name"] as String
  val avatarUrl: String? = jwt["picture"] as String
  val name: String? get() = "$firstName $lastName"
  val issuedAt: Instant = Instant.ofEpochSecond((jwt["iat"] as Int).toLong())
  val expiresAt: Instant = Instant.ofEpochSecond((jwt["exp"] as Long))
  val jwtId: String = jwt["jti"] as String

  override fun getUsername(): String? = username
  override fun getAuthorities() = listOf(SimpleGrantedAuthority("ROLE_USER"))
  override fun getPassword(): String? = null
  override fun isAccountNonExpired(): Boolean = true
  override fun isAccountNonLocked(): Boolean = true
  override fun isCredentialsNonExpired(): Boolean = expiresAt.isBefore(Instant.now())
  override fun isEnabled(): Boolean = true
  override fun toString(): String {
    return "OpenIdConnectUserDetails(issuer='$issuer', authorizedParty='$authorizedParty', audience='$audience', subject='$subject', username=$username, firstName=$firstName, lastName=$lastName, avatarUrl=$avatarUrl, issuedAt=$issuedAt, expiresAt=$expiresAt, jwtId='$jwtId')"
  }
}

@Component
class UserAuthConverter(
  private val jdbi: Jdbi
) : UserAuthenticationConverter {
  private val log by logger()
  private val authCache: Cache<String, UsernamePasswordAuthenticationToken> =
    Caffeine.newBuilder()
      .removalListener { key: String?, value: UsernamePasswordAuthenticationToken?, cause ->
        if (log.isDebugEnabled && value != null) {
          val expiresAt = (value.details as OpenIdConnectUserDetails).expiresAt
          log.debug(
            "{} has been removed from the auth cache with cause: {}. Expiry time was: {}", key, cause, expiresAt
          )
        }
      }
      .expireAfter(TokenExpiration())
      .build<String, UsernamePasswordAuthenticationToken>()

  inner class TokenExpiration : Expiry<String, UsernamePasswordAuthenticationToken> {
    override fun expireAfterUpdate(
      jwtId: String,
      authToken: UsernamePasswordAuthenticationToken,
      currentTime: Long, currentDuration: Long
    ): Long {
      return currentDuration
    }

    override fun expireAfterCreate(
      jwtId: String, authToken: UsernamePasswordAuthenticationToken, currentTime: Long
    ): Long {
      return authToken.calcTimeUntilExpirationInNanos(jwtId)
    }

    override fun expireAfterRead(
      jwtId: String,
      authToken: UsernamePasswordAuthenticationToken,
      currentTime: Long, currentDuration: Long
    ): Long {
      return currentDuration
    }

    private fun UsernamePasswordAuthenticationToken.calcTimeUntilExpirationInNanos(jwtId: String): Long {
      val expiresAt = (details as OpenIdConnectUserDetails).expiresAt
      val duration = Duration.between(Instant.now(), expiresAt)

      if (log.isTraceEnabled) {
        log.trace("Cache key {} will expire in {}", jwtId, duration)
      }
      return duration.toNanos()
    }
  }

  override fun extractAuthentication(jwt: Map<String, *>): Authentication? {
    val jwtId: String = jwt["jti"] as String
    return authCache.get(jwtId) {
      createAuthenticationToken(jwt)
    }
  }

  private fun createAuthenticationToken(jwt: Map<String, *>): UsernamePasswordAuthenticationToken {
    return jdbi.inTransactionUnchecked {
      val userDao = it.attach(UserDao::class.java)
      val details = OpenIdConnectUserDetails(jwt)

      val principal: PublicUserDTO = when (userDao.existsByGoogleId(GoogleId(details.subject))) {
        true -> onExistingUser(userDao, details)
        false -> onNewUser(userDao, details)
      }

      val authToken = UsernamePasswordAuthenticationToken(principal, "N/A", details.authorities)
      authToken.details = details
      authToken
    }
  }

  fun onExistingUser(userDao: UserDao, details: OpenIdConnectUserDetails): PublicUserDTO {
    val user = userDao.findPublicUserByGoogleId(GoogleId(details.subject)) ?: throw NotFoundException("user")
    val firstName = details.firstName ?: "Mr Noname"
    val lastName = details.lastName ?: "Anybody"

    userDao.updateUserOnLogin(user.id, firstName, lastName, details.avatarUrl)
    log.info("User {} logged in. Expiry time: {}", user.id, details.expiresAt)
    return user.copy(firstName = firstName, lastName = lastName, avatar = details.avatarUrl)
  }

  fun onNewUser(userDao: UserDao, details: OpenIdConnectUserDetails): PublicUserDTO {
    val newUser = UserDTO(
      id = UserID.random(),
      googleId = GoogleId(details.subject),
      calendarFeedId = CalendarFeedID.random(),
      firstName = details.firstName ?: "Bosse",
      lastName = details.lastName ?: "Ringholm",
      nick = Nick(details.firstName ?: "Houdini"),
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
      .antMatchers(HttpMethod.GET, "/prometheus").permitAll()
      .antMatchers(HttpMethod.GET, "/health/**").permitAll()
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
