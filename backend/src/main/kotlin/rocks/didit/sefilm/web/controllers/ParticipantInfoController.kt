package rocks.didit.sefilm.web.controllers

import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import rocks.didit.sefilm.Application
import rocks.didit.sefilm.database.entities.ParticipantPaymentInfo
import rocks.didit.sefilm.domain.dto.ParticipantInfoDTO
import rocks.didit.sefilm.services.ParticipantPaymentInfoService

@RestController
class ParticipantInfoController(
  private val ppiService: ParticipantPaymentInfoService) {
  companion object {
    private const val PATH = Application.API_BASE_PATH + "/participantinfo"
  }

  @PutMapping(PATH)
  fun update(@RequestBody body: ParticipantInfoDTO): ParticipantPaymentInfo = ppiService.updatePaymentInfo(body)
}