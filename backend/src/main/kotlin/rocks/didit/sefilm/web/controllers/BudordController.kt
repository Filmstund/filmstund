package rocks.didit.sefilm.web.controllers

import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController
import rocks.didit.sefilm.Application
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.database.entities.BioBudord
import rocks.didit.sefilm.database.repositories.BudordRepository
import java.security.SecureRandom


@RestController
class BudordController(private val budordRepo: BudordRepository) {
    companion object {
        internal const val PATH = Application.API_BASE_PATH + "/budord"
    }

    @GetMapping(PATH, produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
    fun all() = budordRepo.findAll()

    @GetMapping(PATH + "/random", produces = arrayOf(MediaType.APPLICATION_JSON_UTF8_VALUE))
    fun random(): BioBudord {
        val all = budordRepo.findAll()
        val count = all.count() - 1
        if (count <= 0) {
            throw NotFoundException("any budord :(")
        }

        val randomIndex = SecureRandom().nextInt(count)
        return all.elementAt(randomIndex)
    }
}