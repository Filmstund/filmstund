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
import rocks.didit.sefilm.TestConfig
import rocks.didit.sefilm.database.DbConfig
import rocks.didit.sefilm.nextLocation
import rocks.didit.sefilm.nextLocationAlias
import java.util.concurrent.ThreadLocalRandom

@ExtendWith(SpringExtension::class)
@SpringBootTest(classes = [Jdbi::class])
@Import(TestConfig::class, DbConfig::class)
internal class LocationDaoTest {
  @Autowired
  private lateinit var jdbi: Jdbi

  private val rnd: ThreadLocalRandom = ThreadLocalRandom.current()

  @Test
  internal fun `given at least one location, when findAll(), then at least that location is returned`() {
    val rndLoc = rnd.nextLocation(rnd.nextLocationAlias(5))

    jdbi.useExtensionUnchecked(LocationDao::class) {
      it.insertLocation(rndLoc)
      it.insertAlias(rndLoc.name, rndLoc.alias)

      val allLocs = it.findAll()
      assertThat(allLocs).isNotEmpty

      val dbLoc = allLocs.firstOrNull { l -> l.name == rndLoc.name }
      assertThat(dbLoc)
        .isNotNull
        .isEqualToIgnoringGivenFields(rndLoc, "lastModifiedDate")
    }
  }

  @Test
  internal fun `given a location, when findByName, then that location is returned`() {
    val rndLoc = rnd.nextLocation(rnd.nextLocationAlias(2))

    jdbi.useExtensionUnchecked(LocationDao::class) {
      it.insertLocation(rndLoc)
      it.insertAlias(rndLoc.name, rndLoc.alias)

      val dbLoc = it.findByNameOrAlias(rndLoc.name)
      assertThat(dbLoc)
        .isEqualToIgnoringGivenFields(rndLoc, "lastModifiedDate")

      rndLoc.alias.forEach { a ->
        assertThat(it.findByNameOrAlias(a))
          .isEqualTo(dbLoc)
          .isEqualToIgnoringGivenFields(rndLoc, "lastModifiedDate")
      }
    }
  }
}