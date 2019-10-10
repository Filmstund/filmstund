package rocks.didit.sefilm.services

import org.assertj.core.api.Assertions.assertThat
import org.jdbi.v3.core.Jdbi
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.junit.jupiter.SpringExtension
import rocks.didit.sefilm.TestConfig
import rocks.didit.sefilm.database.DbConfig
import rocks.didit.sefilm.database.repositories.BudordRepository
import rocks.didit.sefilm.domain.dto.BioBudordDTO

@ExtendWith(SpringExtension::class)
@SpringBootTest(classes = [Jdbi::class, BudordRepository::class, BudordService::class])
@Import(DbConfig::class, TestConfig::class)
internal class BudordServiceTest {

  @Autowired
  lateinit var budordService: BudordService

  val expectedBudords = listOf(
    BioBudordDTO(1, "Du skall icke spoila"),
    BioBudordDTO(2, "Låt din nästa se på bio såsom du själv skulle vilja se på bio"),
    BioBudordDTO(3, "Du skall icke späda din cola"),
    BioBudordDTO(4, "Det skall alltid finnas något att nomma på"),
    BioBudordDTO(5, "Du skola icke låta teoretiska biopoäng gå till spillo"),
    BioBudordDTO(6, "Du skall inga andra biogudar hava vid sidan av mig"),
    BioBudordDTO(7, "Du skall offra vart hundrade popcorn till din nästa"),
    BioBudordDTO(8, "Tänk på biodagen så att du helgar den"),
    BioBudordDTO(9, "Du skall icke stjäla din grannes popcorn utan vänta tryggt på ditt hundrade"),
    BioBudordDTO(10, "Du skall icke frestas av 3D, ty det är djävulens påfund"),
    BioBudordDTO(37, "Tag icke med en bebis")
  )

  @Test()
  internal fun `all 11 budord are expected from liquibase`() {
    assertThat(budordService.getAll())
      .hasSize(11)
      .containsAll(expectedBudords)
  }
}