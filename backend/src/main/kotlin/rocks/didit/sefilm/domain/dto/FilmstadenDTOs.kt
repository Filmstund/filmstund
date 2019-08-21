package rocks.didit.sefilm.domain.dto

import org.slf4j.LoggerFactory
import java.time.Instant
import java.time.LocalDate
import java.time.ZonedDateTime

data class FilmstadenRatingDTO(
        val age: Int,
        val ageAccompanied: Int,
        val alias: String,
        val displayName: String
)

data class FilmstadenMovieDTO(
        val ncgId: String,
        val title: String,
        val releaseDate: LocalDate,
        val rating: FilmstadenRatingDTO,
        val posterUrl: String?,
        val slug: String,
        val length: Int?,
        val genres: List<FilmstadenGenreDTO> = listOf()
)

data class FilmstadenOriginalLanguageDTO(
        val alias: String,
        val englishName: String,
        val nativeName: String,
        val displayName: String
)

data class FilmstadenPersonDTO(val displayName: String?, val firstName: String?, val lastName: String?)

data class FilmstadenGenreDTO(val name: String)

data class FilmstadenExtendedMovieDTO(
        val ncgId: String?,
        val languageId: String?,
        val originalLanguage: String?,
        val originalLanguages: Collection<FilmstadenOriginalLanguageDTO>?,
        val productionYear: Int?,
        val producers: Collection<FilmstadenPersonDTO>?,
        val genres: Collection<FilmstadenGenreDTO>?,
        val title: String?,
        val originalTitle: String?,
        val shortDescription: String?,
        val longDescription: String?,
        val releaseDate: LocalDate?,
        val actors: Collection<FilmstadenPersonDTO>?,
        val directors: Collection<FilmstadenPersonDTO>?,
        val rating: FilmstadenRatingDTO?,
        val length: Long?,
        val posterUrl: String?,
        val slug: String?
)

data class FilmstadenAttributeDTO(val alias: String, val displayName: String)

data class FilmstadenScreenDTO(
        val ncgId: String,
        val title: String,
        val slug: String,
        val seatCount: Int,
        val remoteSystemAlias: String,
        val remoteEntityId: String
)
fun FilmstadenScreenDTO.toFilmstadenLiteScreen() = FilmstadenLiteScreenDTO(this.ncgId, this.title)

data class FilmstadenShowItemsDTO(val totalNbrOfItems: Int, val items: List<FilmstadenShowDTO>)
data class FilmstadenLocationItemsDTO(val totalNbrOfItems: Int, val items: List<FilmstadenCinemaWithAddressDTO>)
data class FilmstadenMovieItemsDTO(val totalNbrOfItems: Int, val items: List<FilmstadenMovieDTO>)

data class FilmstadenShowDTO(
        val remoteSystemAlias: String,
        val remoteEntityId: String,
        val unnumbered: Boolean,
        val time: ZonedDateTime,
        val timeUtc: Instant,
        val movie: FilmstadenMovieDTO,
        val movieVersion: Map<String, Any>,
        val attributes: List<FilmstadenAttributeDTO>,
        val cinema: FilmstadenCinemaWithAddressDTO,
        val screen: FilmstadenScreenDTO
)

data class FilmstadenCinemaWithAddressDTO(
        val ncgId: String?,
        val title: String,
        val address: FilmstadenAddressDTO,
        val slug: String,
        val remoteSystemAlias: String,
        val remoteEntityId: String
)

data class FilmstadenAddressDTO(
        val phoneNumber: String?,
        val streetAddress: String,
        val postalCode: String,
        val postalAddress: String,
        val city: Map<String, String>,
        val country: Map<String, String>,
        val coordinates: FilmstadenCoordinatesDTO
)

data class FilmstadenCoordinatesDTO(val latitude: String, val longitude: String)

data class FilmstadenLiteScreenDTO(val filmstadenId: String, val name: String)
data class FilmstadenShowingDTO(
        val cinemaName: String,
        val screen: FilmstadenLiteScreenDTO,
        val seatCount: Int,
        val timeUtc: Instant,
        val tags: List<FilmstadenTag>,
        val filmstadenRemoteEntityId: String
) {
    companion object {
        fun from(show: FilmstadenShowDTO) = FilmstadenShowingDTO(
                show.cinema.title,
                FilmstadenLiteScreenDTO(show.screen.ncgId, show.screen.title),
                show.screen.seatCount,
                show.timeUtc,
                FilmstadenTag.convertTags(show.attributes),
                show.remoteEntityId
        )
    }
}

data class FilmstadenSeatMapDTO(
        val remoteSystemAlias: String,
        val remoteEntityId: String,
        val row: Int,
        val number: Int,
        val seatType: String,
        val coordinates: FilmstadenSeatCoordinates,
        val dimensions: FilmstadenSeatDimensions,
        val languageId: String
)

data class FilmstadenSeatCoordinates(
        val x: Float,
        val y: Float
)

data class FilmstadenSeatDimensions(
        val width: Int,
        val height: Int
)

enum class FilmstadenTag {
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
    Barnvagnsbio,
    Knattebio,
    Unknown;

    companion object {
        private val log = LoggerFactory.getLogger(FilmstadenTag::class.java)

        fun convertTags(attributes: List<FilmstadenAttributeDTO>): List<FilmstadenTag> {
            return attributes.map { a ->
                try {
                    FilmstadenTag.valueOf(a.displayName)
                } catch (e: IllegalArgumentException) {
                    log.warn("FilmstadenTag with name $a does not exist")
                    return@map null
                }
            }.filterNotNull()
        }
    }
}


