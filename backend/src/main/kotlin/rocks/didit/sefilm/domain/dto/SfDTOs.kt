package rocks.didit.sefilm.domain.dto

import org.slf4j.LoggerFactory
import java.time.Instant
import java.time.LocalDate
import java.time.ZonedDateTime

data class SfRatingDTO(val age: Int,
                       val ageAccompanied: Int,
                       val alias: String,
                       val displayName: String)

data class SfMovieDTO(val ncgId: String,
                      val title: String,
                      val releaseDate: LocalDate,
                      val rating: SfRatingDTO,
                      val posterUrl: String,
                      val slug: String,
                      val length: Int?,
                      val genres: List<SfGenreDTO> = listOf())

data class SfOriginalLanguageDTO(val alias: String,
                                 val englishName: String,
                                 val nativeName: String,
                                 val displayName: String)

data class SfPersonDTO(val displayName: String?, val firstName: String?, val lastName: String?)

data class SfGenreDTO(val name: String)

data class SfExtendedMovieDTO(val ncgId: String?,
                              val languageId: String?,
                              val originalLanguage: String?,
                              val originalLanguages: Collection<SfOriginalLanguageDTO>?,
                              val productionYear: Int?,
                              val producers: Collection<SfPersonDTO>?,
                              val genres: Collection<SfGenreDTO>?,
                              val title: String?,
                              val originalTitle: String?,
                              val shortDescription: String?,
                              val longDescription: String?,
                              val releaseDate: LocalDate?,
                              val actors: Collection<SfPersonDTO>?,
                              val directors: Collection<SfPersonDTO>?,
                              val rating: SfRatingDTO?,
                              val length: Long?,
                              val posterUrl: String?,
                              val slug: String?)

data class SfAttributeDTO(val alias: String, val displayName: String)

data class SfScreenDTO(val ncgId: String, val title: String, val slug: String, val seatCount: Int, val remoteSystemAlias: String, val remoteEntityId: String)

data class SfShowItemsDTO(val totalNbrOfItems: Int, val items: List<SfShowDTO>)
data class SfLocationItemsDTO(val totalNbrOfItems: Int, val items: List<SfCinemaWithAddressDTO>)
data class SfMovieItemsDTO(val totalNbrOfItems: Int, val items: List<SfMovieDTO>)

data class SfShowDTO(
  val remoteSystemAlias: String,
  val remoteEntityId: String,
  val unnumbered: Boolean,
  val time: ZonedDateTime,
  val timeUtc: Instant,
  val movie: SfMovieDTO,
  val movieVersion: Map<String, Any>,
  val attributes: List<SfAttributeDTO>,
  val cinema: SfCinemaWithAddressDTO,
  val screen: SfScreenDTO
)

data class SfCinemaWithAddressDTO(
  val ncgId: String?,
  val title: String,
  val address: SfAddressDTO,
  val slug: String,
  val remoteSystemAlias: String,
  val remoteEntityId: String
)

data class SfAddressDTO(
  val phoneNumber: String?,
  val streetAddress: String,
  val postalCode: String,
  val postalAddress: String,
  val city: Map<String, String>,
  val country: Map<String, String>,
  val coordinates: SfCoordinatesDTO
)

data class SfCoordinatesDTO(val latitude: String, val longitude: String)

data class SfShowingDTO(
  val cinemaName: String,
  val screenName: String,
  val seatCount: Int,
  val timeUtc: Instant,
  val tags: List<SfTag>
) {
  companion object {
    fun from(show: SfShowDTO) = SfShowingDTO(show.cinema.title,
      show.screen.title,
      show.screen.seatCount,
      show.timeUtc,
      SfTag.convertTags(show.attributes))
  }
}

enum class SfTag {
  `18år`,
  `3D`,
  VIP,
  TXT,
  EN,
  JA,
  SV,
  `Sommar på bio`,
  `Utmärkt film`,
  `Syntolkning`,
  `Uppläst text`,
  Klassiker,
  Classic,
  `Ej textad`,
  Textad,
  Familj,
  Knattebio,
  Unknown;

  companion object {
    private val log = LoggerFactory.getLogger(SfTag::class.java)

    fun convertTags(attributes: List<SfAttributeDTO>): List<SfTag> {
      return attributes.map { a ->
        try {
          SfTag.valueOf(a.displayName)
        } catch (e: IllegalArgumentException) {
          log.warn("SfTag with name $a does not exist")
          return@map null
        }
      }.filterNotNull()
    }
  }
}


