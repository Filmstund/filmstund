import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.web.client.RestTemplate
import se.filmstund.*
import se.filmstund.events.*
import java.util.concurrent.ThreadLocalRandom


@ExtendWith(SpringExtension::class)
@SpringBootTest(classes = [GwenProvider::class, RestTemplate::class, Properties::class])
internal class GwenProviderTest {

  @Autowired
  private lateinit var properties: Properties

  @Autowired
  private lateinit var gwenProvider: GwenProvider

  @Test
  fun receiveEvent() {
    properties.gwen.apiUrl = "localhost"
    properties.gwen.secret = "1234"
    val random = ThreadLocalRandom.current()
    val movie = random.nextMovie()
    val user = random.nextPublicUserDTO()
    val showing = random.nextShowing(movie.id, user.id)
    val event = NewShowingEvent(showing, user)
    gwenProvider.receiveEvent(event)
  }
}