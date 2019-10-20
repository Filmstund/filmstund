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
import se.filmstund.database.DbConfig
import se.filmstund.database.dao.LocationDao
import se.filmstund.domain.dto.core.LocationDTO
import se.filmstund.nextLocation
import java.util.concurrent.ThreadLocalRandom

@ExtendWith(SpringExtension::class)
@SpringBootTest(classes = [Jdbi::class, LocationService::class])
@Import(TestConfig::class, DbConfig::class)
internal class LocationServiceTest {
  @Autowired
  private lateinit var locationService: LocationService

  @Autowired
  private lateinit var locationDao: LocationDao

  private val rnd: ThreadLocalRandom = ThreadLocalRandom.current()

  @Test
  internal fun `given no location, when getOrCreateNewLocation(), then the requested location is inserted and returned`() {
    val locationName = "loc${rnd.nextLong()}"
    assertThat(locationService.getOrCreateNewLocation(locationName))
      .isEqualToIgnoringGivenFields(LocationDTO(locationName), "lastModifiedDate")

    assertThat(locationDao.findByNameOrAlias(locationName))
      .isNotNull
      .isEqualToIgnoringGivenFields(LocationDTO(locationName), "lastModifiedDate")
  }

  @Test
  internal fun `given an existing location, when getOrCreateNewLocation(), then location is returned directly`() {
    val rndLocation = rnd.nextLocation(listOf())
    locationDao.insertLocation(rndLocation)

    assertThat(locationService.getOrCreateNewLocation(rndLocation.name))
      .isEqualToIgnoringGivenFields(rndLocation, "lastModifiedDate")
  }
}