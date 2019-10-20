package se.filmstund.services

import org.assertj.core.api.Assertions.assertThat
import org.jdbi.v3.core.Jdbi
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.junit.jupiter.SpringExtension
import se.filmstund.TestConfig
import se.filmstund.WithLoggedInUser
import se.filmstund.currentLoggedInUser
import se.filmstund.database.DbConfig
import se.filmstund.database.dao.UserDao
import se.filmstund.domain.PhoneNumber
import se.filmstund.domain.dto.UserDetailsDTO
import se.filmstund.domain.id.FilmstadenMembershipId
import java.util.concurrent.ThreadLocalRandom

@ExtendWith(SpringExtension::class)
@SpringBootTest(classes = [Jdbi::class, UserService::class])
@Import(TestConfig::class, DbConfig::class)
internal class UserServiceTest {
  @Autowired
  private lateinit var userService: UserService

  @Autowired
  private lateinit var userDao: UserDao

  private val rnd: ThreadLocalRandom = ThreadLocalRandom.current()

  @Test
  @WithLoggedInUser
  internal fun `given a logged in user, when updateUser(null, null, null), then all values are removed`() {
    val userDetails = UserDetailsDTO(null, null, null)

    val beforeUpdate = userDao.findById(currentLoggedInUser().id)
    assertThat(beforeUpdate?.nick)
      .isNotNull()
    assertThat(beforeUpdate?.phone)
      .isNotNull
    assertThat(beforeUpdate?.filmstadenMembershipId)
      .isNotNull

    val afterUpdate = userService.updateUser(userDetails)
    assertThat(afterUpdate)
      .isEqualToIgnoringGivenFields(beforeUpdate, "nick", "phone", "filmstadenMembershipId", "lastModifiedDate")
    assertThat(afterUpdate.nick)
      .describedAs("nick")
      .isNotNull()
      .isEqualTo("")
    assertThat(afterUpdate.phone)
      .describedAs("phone")
      .isNull()
    assertThat(afterUpdate.filmstadenMembershipId)
      .describedAs("filmstadenId")
      .isNull()
    assertThat(afterUpdate.lastModifiedDate)
      .isAfter(beforeUpdate?.lastModifiedDate)
  }

  @Test
  @WithLoggedInUser
  internal fun `given a logged in user, when updateUser(), then all values are updated`() {
    val userDetails = UserDetailsDTO("newNick", "073-0000000", "abc-xyz")

    val beforeUpdate = userDao.findById(currentLoggedInUser().id)
    assertThat(beforeUpdate?.nick)
      .isNotNull()
      .isNotEqualTo("newNick")
    assertThat(beforeUpdate?.phone)
      .isNotNull
      .isNotEqualTo("073-0000000")
    assertThat(beforeUpdate?.filmstadenMembershipId)
      .isNotNull
      .isNotEqualTo("abc-xyz")

    val afterUpdate = userService.updateUser(userDetails)
    assertThat(afterUpdate)
      .isEqualToIgnoringGivenFields(beforeUpdate, "nick", "phone", "filmstadenMembershipId", "lastModifiedDate")
    assertThat(afterUpdate.nick)
      .describedAs("nick")
      .isNotNull()
      .isEqualTo("newNick")
    assertThat(afterUpdate.phone)
      .describedAs("phone")
      .isNotNull
      .isEqualTo(PhoneNumber("073-000 00 00"))
    assertThat(afterUpdate.filmstadenMembershipId)
      .describedAs("filmstadenId")
      .isNotNull
      .isEqualTo(FilmstadenMembershipId("ABC-XYZ"))
    assertThat(afterUpdate.lastModifiedDate)
      .isAfter(beforeUpdate?.lastModifiedDate)
  }

  @Test
  @WithLoggedInUser
  internal fun `given a logged in user, when invalidateCalendarFeedId(), then a new calendar feed is generated`() {
    val beforeUpdate = userDao.findById(currentLoggedInUser().id)

    val afterUpdate = userService.invalidateCalendarFeedId()
    assertThat(afterUpdate)
      .isEqualToIgnoringGivenFields(beforeUpdate, "calendarFeedId", "lastModifiedDate")
    assertThat(afterUpdate.calendarFeedId)
      .isNotEqualTo(beforeUpdate?.calendarFeedId)
  }

  @Test
  @WithLoggedInUser
  internal fun `given a logged in user, when disableCalendarFeedId(), then the calendar feed id is nullified`() {
    val beforeUpdate = userDao.findById(currentLoggedInUser().id)

    val afterUpdate = userService.disableCalendarFeed()
    assertThat(afterUpdate)
      .isEqualToIgnoringGivenFields(beforeUpdate, "calendarFeedId", "lastModifiedDate")
    assertThat(beforeUpdate?.calendarFeedId)
      .isNotNull()
    assertThat(afterUpdate.calendarFeedId)
      .isNull()
  }
}