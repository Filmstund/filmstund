package se.filmstund.services

import org.assertj.core.api.Assertions.assertThat
import org.jdbi.v3.core.Jdbi
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.security.access.AccessDeniedException
import org.springframework.test.context.junit.jupiter.SpringExtension
import se.filmstund.DatabaseTest
import se.filmstund.TestConfig
import se.filmstund.WithLoggedInUser
import se.filmstund.currentLoggedInUser
import se.filmstund.database.DbConfig
import se.filmstund.domain.SEK
import se.filmstund.domain.dto.AttendeePaymentInfoDTO
import se.filmstund.domain.id.ShowingID
import se.filmstund.domain.id.UserID
import se.filmstund.nextShowing

@ExtendWith(SpringExtension::class)
@SpringBootTest(classes = [Jdbi::class, AttendeePaymentService::class, DatabaseTest::class])
@Import(TestConfig::class, DbConfig::class)
internal class AttendeePaymentServiceTest {
  @Autowired
  private lateinit var attendeePaymentService: AttendeePaymentService

  @Autowired
  private lateinit var databaseTest: DatabaseTest

  @Test
  internal fun `given null showing id, when updatePaymentInfo(), then an IllegalArgumentException is thrown`() {
    val attendeePaymentInfoDTO = AttendeePaymentInfoDTO(userId = UserID.random(), showingId = null)
    assertThrowsIllegalArgumentException(attendeePaymentInfoDTO)
  }

  @Test
  internal fun `given null user id, when updatePaymentInfo(), then an IllegalArgumentException is thrown`() {
    val attendeePaymentInfoDTO = AttendeePaymentInfoDTO(userId = null, showingId = ShowingID.random())
    assertThrowsIllegalArgumentException(attendeePaymentInfoDTO)
  }

  private fun assertThrowsIllegalArgumentException(attendeePaymentInfoDTO: AttendeePaymentInfoDTO) {
    val e = assertThrows<IllegalArgumentException> {
      attendeePaymentService.updatePaymentInfo(attendeePaymentInfoDTO)
    }
    assertThat(e)
      .hasMessage("Missing showing id and/or user id")
  }

  @Test
  @WithLoggedInUser
  internal fun `given non existent user or showing, when updatePaymentInfo(), then an AccessDeniedException is thrown`() {
    val attendeeInfo = AttendeePaymentInfoDTO(userId = currentLoggedInUser().id, showingId = ShowingID.random())
    val e = assertThrows<AccessDeniedException> {
      attendeePaymentService.updatePaymentInfo(attendeeInfo)
    }
    assertThat(e)
      .hasMessage("Only the showing admin is allowed to do that")
  }

  @Test
  @WithLoggedInUser
  internal fun `given showing with attendee, when updatePaymentInfo() but with wrong admin, then an AccessDeniedException is thrown`() {
    databaseTest.start {
      withMovie()
      withUser()
      withShowing { it.nextShowing(movie.id, adminId = user.id) }
      withAttendeesOnLastShowing()
      afterInsert {
        val paymentInfo = AttendeePaymentInfoDTO(
          attendee.userId,
          showing.id,
          true,
          SEK(1337)
        )
        val e = assertThrows<AccessDeniedException> {
          attendeePaymentService.updatePaymentInfo(paymentInfo)
        }
        assertThat(e).hasMessage("Only the showing admin is allowed to do that")
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given showing with attendee, when updatePaymentInfo(), then the attendee payment info is updated correctly`() {
    databaseTest.start {
      withMovie()
      withShowing { it.nextShowing(movie.id, adminId = currentLoggedInUser().id) }
      withAttendeesOnLastShowing()
      afterInsert {
        val dbAttendeeBefore = it.attendeeDao.findByUserAndShowing(attendee.userId, showing.id)
        assertThat(dbAttendeeBefore).isNotNull

        val paymentInfo = AttendeePaymentInfoDTO(
          attendee.userId,
          showing.id,
          !dbAttendeeBefore?.hasPaid!!,
          SEK(1337)
        )

        attendeePaymentService.updatePaymentInfo(paymentInfo)

        val dbAttendee = it.attendeeDao.findByUserAndShowing(attendee.userId, showing.id)
        assertThat(dbAttendee).isNotNull
        assertThat(dbAttendee?.hasPaid).isNotEqualTo(dbAttendeeBefore.hasPaid)
        if (paymentInfo.hasPaid) {
          assertThat(dbAttendee?.amountOwed)
            .isNotEqualTo(dbAttendeeBefore.amountOwed)
            .isEqualTo(SEK(0))
        } else {
          assertThat(dbAttendee?.amountOwed)
            .isEqualTo(dbAttendeeBefore.amountOwed)
            .isNotEqualTo(SEK(1337)) // The update does not update take into consideration amountOwed yet...
        }
      }
    }
  }
}