package rocks.didit.sefilm

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RestController

@RestController
class ShowingController(@Autowired
                        val showingRepository: ShowingRepository) {

    @GetMapping("/showings")
    fun allShowings() = showingRepository.findAll()

    @GetMapping("/showing/{id}")
    fun getShowingById(@PathVariable(value = "id") id: Long) = showingRepository.findOne(id)
}