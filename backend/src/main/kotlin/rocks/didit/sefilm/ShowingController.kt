package rocks.didit.sefilm

import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class ShowingController {
    @RequestMapping("/greeting")
    fun greeting(@RequestParam(value = "name", defaultValue = "world") name: String): Greeting {
        return Greeting("Hello, $name")
    }
}