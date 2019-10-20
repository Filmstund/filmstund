package se.filmstund

import org.slf4j.LoggerFactory
import se.filmstund.domain.id.IMDbID
import se.filmstund.domain.id.TMDbID

fun String.toImdbId() = IMDbID.valueOf(this)
fun Long.toTmdbId() = TMDbID.valueOf(this)

inline fun <reified T, E : Throwable> T?.orElseThrow(exceptionSupplier: () -> E): T = this ?: throw exceptionSupplier()

fun <T : Any> T.logger() = lazy { LoggerFactory.getLogger(this::class.java) }
