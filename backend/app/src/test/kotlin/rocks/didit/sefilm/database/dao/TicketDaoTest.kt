package rocks.didit.sefilm.database.dao

import org.jdbi.v3.core.Jdbi
import org.junit.jupiter.api.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.junit4.SpringRunner
import rocks.didit.sefilm.TestConfig
import rocks.didit.sefilm.database.DbConfig
import java.util.concurrent.ThreadLocalRandom

@RunWith(SpringRunner::class)
@SpringBootTest(classes = [Jdbi::class])
@Import(TestConfig::class, DbConfig::class)
internal class TicketDaoTest {
  @Autowired
  private lateinit var jdbi: Jdbi

  private val rnd: ThreadLocalRandom = ThreadLocalRandom.current()

  @Test
  internal fun `given an existing user, when exists(), then return true`() {
    TODO("Not yet implemented")
    //val rndUser = rnd.nextUserDTO()

    //jdbi.useExtensionUnchecked(UserDao::class) {
    //  it.insertUser(rndUser)
    //  assertThat(it.existsById(rndUser.id)).isTrue()
    //}
  }

}