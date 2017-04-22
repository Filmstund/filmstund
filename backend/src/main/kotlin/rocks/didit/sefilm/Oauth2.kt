package rocks.didit.sefilm

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
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
import org.springframework.security.oauth2.client.OAuth2RestOperations
import org.springframework.security.oauth2.client.OAuth2RestTemplate
import org.springframework.security.oauth2.client.filter.OAuth2ClientContextFilter
import org.springframework.security.oauth2.client.resource.OAuth2ProtectedResourceDetails
import org.springframework.security.oauth2.client.token.grant.code.AuthorizationCodeResourceDetails
import org.springframework.security.oauth2.common.OAuth2AccessToken
import org.springframework.security.oauth2.common.exceptions.InvalidTokenException
import org.springframework.security.oauth2.common.exceptions.OAuth2Exception
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableOAuth2Client
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter
import org.springframework.security.web.authentication.AuthenticationSuccessHandler
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler
import org.springframework.security.web.authentication.preauth.AbstractPreAuthenticatedProcessingFilter
import org.springframework.security.web.util.matcher.AntPathRequestMatcher
import rocks.didit.sefilm.database.entities.User
import rocks.didit.sefilm.database.repositories.UserRepository
import java.io.IOException
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
        details.scope = listOf("openid", "email", "profile")
        details.preEstablishedRedirectUri = redirectUri
        details.isUseCurrentUri = false
        return details
    }

    @Bean
    fun googleOpenIdTemplate(clientContext: OAuth2ClientContext): OAuth2RestTemplate {
        return OAuth2RestTemplate(googleOpenId(), clientContext)
    }
}

class OpenIdConnectFilter(defaultFilterProcessesUrl: String, private val userRepository: UserRepository) : AbstractAuthenticationProcessingFilter(defaultFilterProcessesUrl) {
    lateinit var restTemplate: OAuth2RestOperations

    init {
        authenticationManager = NoopAuthenticationManager()
        setAuthenticationSuccessHandler(CreateUserOnSuccessfulAuthHandler(userRepository))
    }

    @Throws(AuthenticationException::class, IOException::class, ServletException::class)
    override fun attemptAuthentication(request: HttpServletRequest, response: HttpServletResponse): Authentication {

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

    fun setRestTemplate(restTemplate2: OAuth2RestTemplate) {
        restTemplate = restTemplate2
    }

    private class CreateUserOnSuccessfulAuthHandler(private val userRepository: UserRepository) : AuthenticationSuccessHandler {
        private val defaultHandler: AuthenticationSuccessHandler = SavedRequestAwareAuthenticationSuccessHandler()

        override fun onAuthenticationSuccess(request: HttpServletRequest?, response: HttpServletResponse?, authentication: Authentication?) {
            val principal = authentication?.principal as OpenIdConnectUserDetails?
                    ?: throw BadCredentialsException("Successful authentication without a given principal")

            val newUser = User(id = principal.userId, name = "${principal.firstName} ${principal.lastName}",
                    email = principal.username ?: "", avatar = principal.avatarUrl)
            userRepository.save(newUser)
            defaultHandler.onAuthenticationSuccess(request, response, authentication)
        }
    }

    private class NoopAuthenticationManager : AuthenticationManager {
        @Throws(AuthenticationException::class)
        override fun authenticate(authentication: Authentication): Authentication {
            throw UnsupportedOperationException("No authentication should be done with this AuthenticationManager")
        }
    }
}

class OpenIdConnectUserDetails(userInfo: Map<String, String>, val token: OAuth2AccessToken?) : UserDetails {

    val userId: String = userInfo.getValue("sub")
    private val username: String? = userInfo["email"]
    val firstName: String? = userInfo["given_name"]
    val lastName: String? = userInfo["family_name"]
    val avatarUrl: String? = userInfo["picture"]
    val verifiedMail: Boolean = userInfo["email_verified"]?.toBoolean() ?: false

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

    @Throws(Exception::class)
    override fun configure(web: WebSecurity) {
        web.ignoring().antMatchers("/resources/**")
    }

    @Bean
    fun myFilter(): OpenIdConnectFilter {
        val filter = OpenIdConnectFilter("/login/google", userRepository!!)
        filter.setRestTemplate(restTemplate!!)
        return filter
    }

    @Throws(Exception::class)
    override fun configure(http: HttpSecurity) {
        http
                .addFilterAfter(OAuth2ClientContextFilter(), AbstractPreAuthenticatedProcessingFilter::class.java)
                .addFilterAfter(myFilter(), OAuth2ClientContextFilter::class.java)
                .logout().logoutSuccessUrl("/").clearAuthentication(true)
                .logoutRequestMatcher(AntPathRequestMatcher("/logout", "GET"))
                // TODO: .and().requiresChannel().anyRequest().requiresSecure()
                .and()
                .csrf().disable()
                .authorizeRequests()
                .antMatchers(HttpMethod.OPTIONS, "/api/**").permitAll()
                .anyRequest().authenticated()
    }
}
