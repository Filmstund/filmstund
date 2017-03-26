package rocks.didit.sefilm.controllers

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RestController
import rocks.didit.sefilm.repositories.UserRepository
import java.util.*

@RestController
class UsersController(@Autowired
                      val userRepository: UserRepository) {

    @GetMapping("/users")
    fun allUsers() = userRepository.findAll()

    @GetMapping("/users/{id}")
    fun getUserById(@PathVariable(value = "id") id: UUID) = userRepository.findOne(id)

}

