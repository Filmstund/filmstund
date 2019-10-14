package rocks.didit.sefilm.services

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
import rocks.didit.sefilm.DatabasePrimer
import rocks.didit.sefilm.TestConfig
import rocks.didit.sefilm.WithLoggedInUser
import rocks.didit.sefilm.currentLoggedInUser
import rocks.didit.sefilm.database.DbConfig
import rocks.didit.sefilm.database.dao.ParticipantDao
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.dto.ParticipantPaymentInfoDTO
import rocks.didit.sefilm.nextShowing
import java.util.*

@ExtendWith(SpringExtension::class)
@SpringBootTest(classes = [Jdbi::class, ParticipantPaymentService::class, DatabasePrimer::class])
@Import(TestConfig::class, DbConfig::class)
internal class ParticipantPaymentServiceTest {
  @Autowired
  private lateinit var participantPaymentService: ParticipantPaymentService

  @Autowired
  private lateinit var databasePrimer: DatabasePrimer

  @Test
  internal fun `given null showing id, when updatePaymentInfo(), then an IllegalArgumentException is thrown`() {
    val participantPaymentInfoDTO = ParticipantPaymentInfoDTO(userId = UUID.randomUUID(), showingId = null)
    assertThrowsIllegalArgumentException(participantPaymentInfoDTO)
  }

  @Test
  internal fun `given null user id, when updatePaymentInfo(), then an IllegalArgumentException is thrown`() {
    val participantPaymentInfoDTO = ParticipantPaymentInfoDTO(userId = null, showingId = UUID.randomUUID())
    assertThrowsIllegalArgumentException(participantPaymentInfoDTO)
  }

  private fun assertThrowsIllegalArgumentException(participantPaymentInfoDTO: ParticipantPaymentInfoDTO) {
    val e = assertThrows<IllegalArgumentException> {
      participantPaymentService.updatePaymentInfo(participantPaymentInfoDTO)
    }
    assertThat(e)
      .hasMessage("Missing showing id and/or user id")
  }

  @Test
  @WithLoggedInUser
  internal fun `given non existent user or showing, when updatePaymentInfo(), then an AccessDeniedException is thrown`() {
    val participantInfo = ParticipantPaymentInfoDTO(userId = currentLoggedInUser().id, showingId = UUID.randomUUID())
    val e = assertThrows<AccessDeniedException> {
      participantPaymentService.updatePaymentInfo(participantInfo)
    }
    assertThat(e)
      .hasMessage("Only the showing admin is allowed to do that")
  }

  @Test
  @WithLoggedInUser
  internal fun `given showing with participant, when updatePaymentInfo() but with wrong admin, then an AccessDeniedException is thrown`() {
    databasePrimer.doDbTest {
      withMovie()
      withUser()
      withShowing { it.nextShowing(movie.id, adminId = user.id) }
      withParticipantOnLastShowing()
      afterInsert {
        val paymentInfo = ParticipantPaymentInfoDTO(
          participant.userId,
          showing.id,
          true,
          SEK(1337)
        )
        val e = assertThrows<AccessDeniedException> {
          participantPaymentService.updatePaymentInfo(paymentInfo)
        }
        assertThat(e).hasMessage("Only the showing admin is allowed to do that")
      }
    }
  }

  @Test
  @WithLoggedInUser
  internal fun `given showing with participant, when updatePaymentInfo(), then the participant payment info is updated correctly`() {
    databasePrimer.doDbTest {
      withMovie()
      withShowing { it.nextShowing(movie.id, adminId = currentLoggedInUser().id) }
      withParticipantOnLastShowing()
      afterInsert {
        val participantDao = it.attach(ParticipantDao::class.java)
        val dbParticipantBefore = participantDao.findByUserAndShowing(participant.userId, showing.id)
        assertThat(dbParticipantBefore).isNotNull

        val paymentInfo = ParticipantPaymentInfoDTO(
          participant.userId,
          showing.id,
          !dbParticipantBefore?.hasPaid!!,
          SEK(1337)
        )

        participantPaymentService.updatePaymentInfo(paymentInfo)

        val dbParticipant = participantDao.findByUserAndShowing(participant.userId, showing.id)
        assertThat(dbParticipant).isNotNull
        assertThat(dbParticipant?.hasPaid).isNotEqualTo(dbParticipantBefore.hasPaid)
        if (paymentInfo.hasPaid) {
          assertThat(dbParticipant?.amountOwed)
            .isNotEqualTo(dbParticipantBefore.amountOwed)
            .isEqualTo(SEK(0))
        } else {
          assertThat(dbParticipant?.amountOwed)
            .isEqualTo(dbParticipantBefore.amountOwed)
            .isNotEqualTo(SEK(1337)) // The update does not update take into consideration amountOwed yet...
        }
      }
    }
  }
}