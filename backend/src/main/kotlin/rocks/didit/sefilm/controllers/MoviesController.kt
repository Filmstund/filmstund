package rocks.didit.sefilm.controllers

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RestController
import rocks.didit.sefilm.repositories.MovieRepository
import java.util.*

@RestController
class MoviesController(@Autowired
                        val movieRepository: MovieRepository) {

    @GetMapping("/movies")
    fun allShowings() = movieRepository.findAll()

    @GetMapping("/movies/{id}")
    fun getMovieById(@PathVariable(value = "id") id: UUID) = movieRepository.findOne(id)
}