package rocks.didit.sefilm.web.controllers

import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController
import rocks.didit.sefilm.Application
import rocks.didit.sefilm.services.BudordService

@RestController
class BudordController(private val budordService: BudordService) {
  companion object {
    internal const val PATH = Application.API_BASE_PATH + "/budord"
  }

  @GetMapping(PATH, produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun all() = budordService.getAll()

  @GetMapping(PATH + "/random", produces = [(MediaType.APPLICATION_JSON_UTF8_VALUE)])
  fun random() = budordService.getRandom()
}