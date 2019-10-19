package rocks.didit.sefilm.database.dao

import org.assertj.core.api.Assertions.assertThat
import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.useExtensionUnchecked
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.junit.jupiter.SpringExtension
import rocks.didit.sefilm.DatabaseTest
import rocks.didit.sefilm.TestConfig
import rocks.didit.sefilm.database.DbConfig
import rocks.didit.sefilm.domain.dto.core.UserDTO
import rocks.didit.sefilm.domain.id.FilmstadenMembershipId
import rocks.didit.sefilm.domain.id.GoogleId
import rocks.didit.sefilm.domain.id.UserID
import rocks.didit.sefilm.nextGiftCert
import rocks.didit.sefilm.nextGiftCerts
import rocks.didit.sefilm.nextUserDTO
import java.time.Instant
import java.util.concurrent.ThreadLocalRandom

@ExtendWith(SpringExtension::class)
@SpringBootTest(classes = [DatabaseTest::class, Jdbi::class])
@Import(TestConfig::class, DbConfig::class)
internal class UserDaoTest {
  @Autowired
  private lateinit var jdbi: Jdbi

  @Autowired
  private lateinit var databaseTest: DatabaseTest

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
      assertThat(it.existsById(UserID.random())).isFalse()
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
  internal fun `given a user, when findIdByGoogleId(), then the user id is returned`() {
    databaseTest.start {
      withUser()
      afterInsert {
        assertThat(user.googleId).isNotNull
        val userId = it.userDao.findIdByGoogleId(user.googleId!!)
        assertThat(userId).isEqualTo(user.id)
      }
    }
  }

  @Test
  internal fun `given a user, when findIdByFilmstadenId(), then the user id is returned`() {
    databaseTest.start {
      withUser()
      afterInsert {
        assertThat(user.filmstadenMembershipId).isNotNull
        val userId = it.userDao.findIdByFilmstadenId(user.filmstadenMembershipId!!)
        assertThat(userId).isEqualTo(user.id)
      }
    }
  }

  @Test
  internal fun `given no user, when findIdByFilmstadenId(), then null returned`() {
    databaseTest.start {
      afterInsert {
        val userId = it.userDao.findIdByFilmstadenId(FilmstadenMembershipId("ASD-FGH"))
        assertThat(userId).isNull()
      }
    }
  }

  @Test
  internal fun `given no user, when findIdByGoogleId(), then null returned`() {
    databaseTest.start {
      afterInsert {
        val userId = it.userDao.findIdByGoogleId(GoogleId("QWERTY123"))
        assertThat(userId).isNull()
      }
    }
  }

  @Test
  internal fun `given user with gift certs, when findById(), then user with gift certs are returned`() {
    val userId = UserID.random()
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
    val userId = UserID.random()
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
    val userId = UserID.random()
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
      val allPublicUsers = it.findAllPublicUsers()
      assertThat(allPublicUsers)
        .isNotEmpty
        .containsExactlyInAnyOrderElementsOf(usersFromDb.map(UserDTO::toPublicUserDTO))
    }
  }

  @Test
  internal fun `given one user, when findPublicUserById(), then the public version of that user is returned`() {
    val userId = UserID.random()
    val rndUser = rnd.nextUserDTO(userId, rnd.nextGiftCerts(userId, 3))

    jdbi.useExtensionUnchecked(UserDao::class) {
      it.insertUserAndGiftCerts(rndUser)

      val publicUser = it.findPublicUserById(userId)
      assertThat(publicUser)
        .isNotNull
        .isEqualTo(rndUser.toPublicUserDTO())
    }
  }

  @Test
  internal fun `given one user, when findPublicUserByGoogleId(), then the public version of that user is returned`() {
    val userId = UserID.random()
    val rndUser = rnd.nextUserDTO(userId, rnd.nextGiftCerts(userId, 3))

    jdbi.useExtensionUnchecked(UserDao::class) {
      it.insertUserAndGiftCerts(rndUser)

      assertThat(rndUser.googleId).isNotNull
      val publicUser = it.findPublicUserByGoogleId(rndUser.googleId!!)
      assertThat(publicUser)
        .isNotNull
        .isEqualTo(rndUser.toPublicUserDTO())
    }
  }

  @Test
  internal fun `given one user, when updateUserOnLogin(), then the user is updated accordingly`() {
    val userId = UserID.random()
    val rndUser = rnd.nextUserDTO(userId, rnd.nextGiftCerts(userId, 3))
      .copy(lastModifiedDate = Instant.now(), lastLogin = Instant.now())

    jdbi.useExtensionUnchecked(UserDao::class) {
      it.insertUserAndGiftCerts(rndUser)

      val dbUser = it.findById(rndUser.id)
      it.updateUserOnLogin(userId, "newFirstName", "newLastName", "newAvatar")
      val updatedDbUser = it.findById(rndUser.id)
      assertThat(dbUser)
        .isNotNull
        .isNotEqualTo(updatedDbUser)
      assertThat(updatedDbUser).isNotNull
      assertThat(updatedDbUser?.firstName).isEqualTo("newFirstName")
      assertThat(updatedDbUser?.lastName).isEqualTo("newLastName")
      assertThat(updatedDbUser?.avatar).isEqualTo("newAvatar")
      assertThat(updatedDbUser?.lastLogin)
        .isNotNull()
        .isAfter(rndUser.lastLogin)
        .isEqualTo(updatedDbUser?.lastModifiedDate)
    }
  }

  @Test
  internal fun `given a gift cert, when findGiftCertByUserAndNumber(), then that gift cert is returned`() {
    val userId = UserID.random()
    val giftCert = rnd.nextGiftCert(userId)
    val rndUser = rnd.nextUserDTO(userId, listOf(giftCert))

    jdbi.useExtensionUnchecked(UserDao::class) {
      it.insertUserAndGiftCerts(rndUser)

      assertThat(it.existGiftCertByNumber(giftCert.number)).isTrue()
      val dbGiftCert = it.findGiftCertByUserAndNumber(userId, giftCert.number)
      assertThat(dbGiftCert)
        .isEqualTo(giftCert)

      assertThat(it.findGiftCertByUserAndNumber(UserID.random(), giftCert.number))
        .isNull()
      assertThat(it.findGiftCertByUserAndNumber(userId, rnd.nextGiftCert(UserID.random()).number))
        .isNull()
    }
  }

  @Test
  internal fun `given at least 2 gift certs, when findGiftCertByUser(), then all gift certs for that user is returned`() {
    val userId = UserID.random()
    val rndUser = rnd.nextUserDTO(userId, rnd.nextGiftCerts(userId, 10))

    jdbi.useExtensionUnchecked(UserDao::class) {
      it.insertUserAndGiftCerts(rndUser)

      val dbGiftCerts = it.findGiftCertByUser(userId)
      assertThat(dbGiftCerts)
        .hasSameSizeAs(rndUser.giftCertificates)
        .containsExactlyInAnyOrderElementsOf(rndUser.giftCertificates)
      assertThat(it.findGiftCertByUser(UserID.random()))
        .isNotNull
        .isEmpty()
    }
  }

  @Test
  internal fun `given at least 2 gift certs, when existGiftCertsByNumbers(), then only tickets that exists return true`() {
    val userId = UserID.random()
    val rndUser = rnd.nextUserDTO(userId, rnd.nextGiftCerts(userId, 10))

    jdbi.useExtensionUnchecked(UserDao::class) {
      it.insertUserAndGiftCerts(rndUser)

      assertThat(it.existGiftCertsByNumbers(rndUser.giftCertificates.map { gc -> gc.number }))
        .isTrue()
      assertThat(it.existGiftCertsByNumbers(listOf(rndUser.giftCertificates.first().number)))
        .isTrue()
      assertThat(it.existGiftCertsByNumbers(listOf(rnd.nextGiftCert(userId).number)))
        .isFalse()
    }
  }

  @Test
  internal fun `given 2 gift certs for a user, when deleteGiftCertByUserAndNumber(), then one gift cert is left`() {
    val userId = UserID.random()
    val rndUser = rnd.nextUserDTO(userId, rnd.nextGiftCerts(userId, 2))

    jdbi.useExtensionUnchecked(UserDao::class) {
      it.insertUserAndGiftCerts(rndUser)

      val numbers = rndUser.giftCertificates.map { gc -> gc.number }
      assertThat(it.existGiftCertsByNumbers(numbers))
        .describedAs("Numbers exists")
        .isTrue()
      assertThat(it.deleteGiftCertByUserAndNumber(userId, numbers.first())).isTrue()
      assertThat(it.existGiftCertByNumber(numbers.first()))
        .describedAs("1st ticket is deleted")
        .isFalse()
      assertThat(it.deleteGiftCertByUserAndNumber(userId, numbers.last())).isTrue()
      assertThat(it.existGiftCertByNumber(numbers.last()))
        .describedAs("2nd ticket is deleted")
        .isFalse()
    }
  }
}