package rocks.didit.sefilm.database.dao

import org.assertj.core.api.Assertions.assertThat
import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.useExtensionUnchecked
import org.junit.jupiter.api.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.junit4.SpringRunner
import rocks.didit.sefilm.TestConfig
import rocks.didit.sefilm.database.DbConfig
import rocks.didit.sefilm.domain.dto.core.UserDTO
import rocks.didit.sefilm.nextGiftCert
import rocks.didit.sefilm.nextGiftCerts
import rocks.didit.sefilm.nextUserDTO
import java.util.*
import java.util.concurrent.ThreadLocalRandom

@RunWith(SpringRunner::class)
@SpringBootTest(classes = [Jdbi::class])
@Import(TestConfig::class, DbConfig::class)
internal class UserDaoTest {
  @Autowired
  private lateinit var jdbi: Jdbi

  private val rnd: ThreadLocalRandom = ThreadLocalRandom.current()

  @Test
  internal fun `given an existing user, when exists(), then return true`() {
    val rndUser = rnd.nextUserDTO()

    jdbi.useExtensionUnchecked(UserDao::class) {
      it.insertUser(rndUser)
      assertThat(it.existsById(rndUser.id)).isTrue()
    }
  }

  @Test
  internal fun `given non existent user, when exist(), then return false`() {
    jdbi.useExtensionUnchecked(UserDao::class) {
      assertThat(it.existsById(UUID.randomUUID())).isFalse()
    }
  }

  @Test
  internal fun `given a new user, when findById(), then same DTO is returned`() {
    val rndUser = rnd.nextUserDTO()

    jdbi.useExtensionUnchecked(UserDao::class) {
      it.insertUser(rndUser)

      val userFromDb = it.findById(rndUser.id)
      assertThat(userFromDb)
        .isNotNull
        .isEqualToIgnoringGivenFields(rndUser, "signupDate")
      // LastLogin and SignupDate is set by the db.
    }
  }

  @Test
  internal fun `given user with gift certs, when findById(), then user with gift certs are returned`() {
    val userId = UUID.randomUUID()
    val rndUser = rnd.nextUserDTO(userId, rnd.nextGiftCerts(userId))

    jdbi.useExtensionUnchecked(UserDao::class) {
      it.insertUser(rndUser)
      it.insertGiftCertificates(rndUser.giftCertificates)

      val userFromDb = it.findById(rndUser.id)
      assertThat(rndUser.giftCertificates).describedAs("rndUser gift certs").isNotEmpty
      assertThat(userFromDb).isNotNull
      assertThat(userFromDb?.giftCertificates)
        .describedAs("db user gift certs")
        .isNotEmpty
        .containsAll(rndUser.giftCertificates)
    }
  }

  @Test
  internal fun `when new user is inserted, then gift certs aren't included in insert`() {
    val userId = UUID.randomUUID()
    val rndUser = rnd.nextUserDTO(userId, rnd.nextGiftCerts(userId, 3))

    jdbi.useExtensionUnchecked(UserDao::class) {
      it.insertUser(rndUser)

      val userFromDb = it.findById(rndUser.id)
      assertThat(rndUser.giftCertificates).isNotEmpty
      assertThat(userFromDb).isNotNull
      assertThat(userFromDb?.giftCertificates)
        .isEmpty()
    }
  }

  @Test
  internal fun `given at least one user, when findAll(), then at least that user is returned`() {
    val userId = UUID.randomUUID()
    val rndUser = rnd.nextUserDTO(userId, rnd.nextGiftCerts(userId, 3))

    jdbi.useExtensionUnchecked(UserDao::class) {
      it.insertUser(rndUser)
      it.insertGiftCertificates(rndUser.giftCertificates)

      val usersFromDb = it.findAll()
      assertThat(usersFromDb)
        .isNotNull
        .isNotEmpty
      val dbUser: UserDTO? = usersFromDb.firstOrNull { u -> u.id == rndUser.id }
      assertThat(dbUser)
        .isNotNull
        .isEqualToIgnoringGivenFields(rndUser, "signupDate")
    }
  }

  @Test
  internal fun `given at a gift cert, when findGiftCertByUserAndNumber(), then that gift cert is returned`() {
    val userId = UUID.randomUUID()
    val giftCert = rnd.nextGiftCert(userId)
    val rndUser = rnd.nextUserDTO(userId, listOf(giftCert))

    jdbi.useExtensionUnchecked(UserDao::class) {
      it.insertUserAndGiftCerts(rndUser)

      assertThat(it.existGiftCertByNumber(giftCert.number)).isTrue()
      val dbGiftCert = it.findGiftCertByUserAndNumber(userId, giftCert.number)
      assertThat(dbGiftCert)
        .isEqualTo(giftCert)

      assertThat(it.findGiftCertByUserAndNumber(UUID.randomUUID(), giftCert.number))
        .isNull()
      assertThat(it.findGiftCertByUserAndNumber(userId, rnd.nextGiftCert(UUID.randomUUID()).number))
        .isNull()
    }
  }
}