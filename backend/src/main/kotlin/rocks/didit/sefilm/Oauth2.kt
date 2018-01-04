package rocks.didit.sefilm

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.builders.WebSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.jwt.JwtHelper
import org.springframework.security.oauth2.client.OAuth2ClientContext
import org.springframework.security.oauth2.client.OAuth2RestTemplate
import org.springframework.security.oauth2.client.filter.OAuth2ClientContextFilter
import org.springframework.security.oauth2.client.resource.OAuth2ProtectedResourceDetails
import org.springframework.security.oauth2.client.token.grant.code.AuthorizationCodeResourceDetails
import org.springframework.security.oauth2.common.OAuth2AccessToken
import org.springframework.security.oauth2.common.exceptions.InvalidTokenException
import org.springframework.security.oauth2.common.exceptions.OAuth2Exception
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableOAuth2Client
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler
import org.springframework.security.web.authentication.preauth.AbstractPreAuthenticatedProcessingFilter
import org.springframework.security.web.util.matcher.AntPathRequestMatcher
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.database.repositories.UserRepository
import rocks.didit.sefilm.domain.UserID
import rocks.didit.sefilm.web.controllers.BudordController
import java.io.IOException
import java.time.Instant
import javax.servlet.ServletException
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@Configuration
@EnableOAuth2Client
class GoogleOpenIdConnectConfig {
  @Value("\${google.clientId}")
  private val clientId: String? = null

  @Value("\${google.clientSecret}")
  private val clientSecret: String? = null

  @Value("\${google.accessTokenUri}")
  private val accessTokenUri: String? = null

  @Value("\${google.userAuthorizationUri}")
  private val userAuthorizationUri: String? = null

  @Value("\${google.redirectUri}")
  private val redirectUri: String? = null

  @Bean
  fun googleOpenId(): OAuth2ProtectedResourceDetails {
    val details = AuthorizationCodeResourceDetails()
    details.clientId = clientId
    details.clientSecret = clientSecret
    details.accessTokenUri = accessTokenUri
    details.userAuthorizationUri = userAuthorizationUri
    details.scope = listOf("openid", "email", "profile", "https://www.googleapis.com/auth/calendar")
    details.preEstablishedRedirectUri = redirectUri
    details.isUseCurrentUri = false
    return details
  }

  @Bean
  fun googleOpenIdTemplate(clientContext: OAuth2ClientContext): OAuth2RestTemplate {
    return OAuth2RestTemplate(googleOpenId(), clientContext)
  }
}

class OpenIdConnectFilter(defaultFilterProcessesUrl: String,
                          userRepository: UserRepository,
                          private val restTemplate: OAuth2RestTemplate,
                          private val loginRedirectUri: String,
                          private val defaultRedirectPath: String) : AbstractAuthenticationProcessingFilter(defaultFilterProcessesUrl) {
  init {
    authenticationManager = NoopAuthenticationManager()
    setAuthenticationSuccessHandler(CreateUserOnSuccessfulAuthHandler(userRepository))
  }

  private fun setRedirectPathInSession(request: HttpServletRequest) {
    val redirectPath = request.getParameter("redirect") ?: defaultRedirectPath

    val session = request.session
    val previousRedirectPath = session.getAttribute("redirectPath")
    if (previousRedirectPath == null)
      session.setAttribute("redirectPath", "$loginRedirectUri/${cleanupRedirectPath(redirectPath)}")
  }

  private fun cleanupRedirectPath(path: String): String {
    var newPath = path
    if (newPath.startsWith("/")) {
      newPath = newPath.substring(1, newPath.length)
    }
    if (newPath.startsWith("http")) {
      newPath = defaultRedirectPath
    }
    return newPath
  }

  @Throws(AuthenticationException::class, IOException::class, ServletException::class)
  override fun attemptAuthentication(request: HttpServletRequest, response: HttpServletResponse): Authentication {
    setRedirectPathInSession(request)

    val accessToken: OAuth2AccessToken
    try {
      accessToken = restTemplate.accessToken
    } catch (e: OAuth2Exception) {
      throw BadCredentialsException("Could not obtain access token", e)
    }

    try {
      val idToken = accessToken.additionalInformation["id_token"].toString()
      val tokenDecoded = JwtHelper.decode(idToken)

      val authInfo: Map<String, String> = ObjectMapper().readValue(tokenDecoded.claims)

      val user = OpenIdConnectUserDetails(authInfo, accessToken)
      return UsernamePasswordAuthenticationToken(user, null, user.authorities)
    } catch (e: InvalidTokenException) {
      throw BadCredentialsException("Could not obtain user details from token", e)
    }

  }

  private class CreateUserOnSuccessfulAuthHandler(private val userRepository: UserRepository) : SimpleUrlAuthenticationSuccessHandler() {
    private val log = LoggerFactory.getLogger(CreateUserOnSuccessfulAuthHandler::class.java)

    override fun onAuthenticationSuccess(request: HttpServletRequest, response: HttpServletResponse, authentication: Authentication?) {
      val principal = authentication?.principal as OpenIdConnectUserDetails?
        ?: throw BadCredentialsException("Successful authentication without a given principal")

      val maybeUser = userRepository.findById(UserID(principal.userId))
      if (!maybeUser.isPresent) {
        val newUser = User(id = UserID(principal.userId),
          name = "${principal.firstName ?: ""} ${principal.lastName ?: ""}",
          firstName = principal.firstName,
          lastName = principal.lastName,
          nick = principal.firstName ?: "Houdini",
          email = principal.username ?: "",
          avatar = principal.avatarUrl,
          lastLogin = Instant.now(),
          signupDate = Instant.now()
        )
        userRepository.save(newUser)
        log.info("Created new user ${newUser.id}")
      } else {
        val updatedUser = maybeUser.map {
          it.copy(name = "${principal.firstName} ${principal.lastName}",
            firstName = principal.firstName,
            lastName = principal.lastName,
            avatar = principal.avatarUrl,
            lastLogin = Instant.now())
        }.get()
        val savedUser = userRepository.save(updatedUser)
        if (savedUser != updatedUser) {
          log.info("Updated user ${savedUser.id}")
        }
      }

      val redirectPath = request.session.getAttribute("redirectPath").toString()
      request.session.setAttribute("redirectPath", null)
      defaultTargetUrl = redirectPath
      super.onAuthenticationSuccess(request, response, authentication)
    }
  }

  private class NoopAuthenticationManager : AuthenticationManager {
    @Throws(AuthenticationException::class)
    override fun authenticate(authentication: Authentication): Authentication {
      throw UnsupportedOperationException("No authentication should be done with this AuthenticationManager")
    }
  }
}

class OpenIdConnectUserDetails(userInfo: Map<String, String>, accessToken: OAuth2AccessToken) : UserDetails {

  val userId: String = userInfo.getValue("sub")
  private val username: String? = userInfo["email"]
  val firstName: String? = userInfo["given_name"]
  val lastName: String? = userInfo["family_name"]
  val avatarUrl: String? = userInfo["picture"]
  val accessToken: OAuth2AccessToken = accessToken

  override fun getUsername(): String? {
    return username
  }

  override fun getAuthorities(): Collection<GrantedAuthority> {
    return listOf(SimpleGrantedAuthority("ROLE_USER"))
  }

  override fun getPassword(): String? {
    return null
  }

  override fun isAccountNonExpired(): Boolean {
    return true
  }

  override fun isAccountNonLocked(): Boolean {
    return true
  }

  override fun isCredentialsNonExpired(): Boolean {
    return true
  }

  override fun isEnabled(): Boolean {
    return true
  }
}

@Configuration
@EnableWebSecurity
class SecurityConfig : WebSecurityConfigurerAdapter() {
  @Autowired
  private val restTemplate: OAuth2RestTemplate? = null

  @Autowired
  private val userRepository: UserRepository? = null

  @Value("\${login.baseRedirectUri}")
  private lateinit var loginRedirectUri: String

  @Value("\${login.defaultRedirectPath}")
  private lateinit var defaultRedirectPath: String

  @Throws(Exception::class)
  override fun configure(web: WebSecurity) {
    web.ignoring().antMatchers("/resources/**")
  }

  @Bean
  fun myFilter() =
    OpenIdConnectFilter("/login/google",
      userRepository!!,
      restTemplate!!,
      loginRedirectUri,
      defaultRedirectPath)

  @Throws(Exception::class)
  override fun configure(http: HttpSecurity) {
    http
      .cors().and()
      .addFilterAfter(OAuth2ClientContextFilter(), AbstractPreAuthenticatedProcessingFilter::class.java)
      .addFilterAfter(myFilter(), OAuth2ClientContextFilter::class.java)
      .logout().logoutSuccessHandler((HttpStatusReturningLogoutSuccessHandler(HttpStatus.ACCEPTED)))
      .deleteCookies("JSESSIONID")
      .invalidateHttpSession(true)
      .clearAuthentication(true)
      .logoutRequestMatcher(AntPathRequestMatcher("/logout", "GET"))
      .and()
      .csrf().disable()
      .authorizeRequests()
      .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
      .antMatchers(HttpMethod.GET, BudordController.PATH).permitAll()
      .antMatchers(HttpMethod.GET, BudordController.PATH + "/random").permitAll()
      .antMatchers(HttpMethod.HEAD, BudordController.PATH).permitAll()
      .antMatchers(HttpMethod.HEAD, BudordController.PATH + "/random").permitAll()
      .anyRequest().authenticated()
  }
}