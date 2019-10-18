package rocks.didit.sefilm

import org.jdbi.v3.core.Jdbi
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.test.context.support.WithSecurityContextFactory
import rocks.didit.sefilm.database.dao.UserDao
import java.util.concurrent.ThreadLocalRandom

class WithCustomUserSecurityContextFactory : WithSecurityContextFactory<WithLoggedInUser> {
  @Autowired
  private lateinit var jdbi: Jdbi

  private val rnd = ThreadLocalRandom.current()

  override fun createSecurityContext(customUser: WithLoggedInUser): SecurityContext {
    val context = SecurityContextHolder.createEmptyContext()

    var rndUser = rnd.nextUserDTO()
    if (customUser.skipPhone) {
      rndUser = rndUser.copy(phone = null)
    }
    jdbi.onDemand(UserDao::class.java).insertUser(rndUser)

    val principal = rndUser.toPublicUserDTO()
    val auth = UsernamePasswordAuthenticationToken(principal, "password", listOf(SimpleGrantedAuthority("ROLE_USER")))
    context.authentication = auth
    return context
  }
}