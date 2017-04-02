package rocks.didit.sefilm.domain

import java.time.LocalDate


data class SfRatingDTO(val age: Int,
                       val ageAccompanied: Int,
                       val alias: String,
                       val displayName: String)

data class SfMovieDTO(val ncgId: String,
                      val title: String,
                      val releaseDate: LocalDate,
                      val rating: SfRatingDTO,
                      val posterUrl: String,
                      val badge: String,
                      val isNew: Boolean,
                      val isUpcoming: Boolean,
                      val slug: String)

data class SfOriginalLanguageDTO(val alias: String,
                                 val englishName: String,
                                 val nativeName: String,
                                 val displayName: String)

data class SfPersonDTO(val displayName: String, val firstName: String, val lastName: String)

data class SfGenreDTO(val name: String)

data class SfExtendedMovieDTO(val ncgId: String,
                              val languageId: String,
                              val originalLanguage: String,
                              val originalLanguages: Collection<SfOriginalLanguageDTO>,
                              val productionYear: Int,
                              val producers: Collection<SfPersonDTO>,
                              val genres: Collection<SfGenreDTO>,
                              val title: String,
                              val originalTitle: String,
                              val shortDescription: String,
                              val longDescription: String,
                              val releaseDate: LocalDate,
                              val actors: Collection<SfPersonDTO>,
                              val directors: Collection<SfPersonDTO>,
                              val rating: SfRatingDTO,
                              val length: Long,
                              val posterUrl: String,
                              val slug: String)
