package rocks.didit.sefilm.web.controllers

import org.springframework.security.access.AccessDeniedException
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import rocks.didit.sefilm.Application
import rocks.didit.sefilm.NotFoundException
import rocks.didit.sefilm.database.entities.ParticipantInfo
import rocks.didit.sefilm.database.repositories.ParticipantInfoRepository
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.domain.SEK
import rocks.didit.sefilm.domain.dto.ParticipantInfoDTO
import rocks.didit.sefilm.isLoggedInUserAdmin
import java.util.*


@RestController
class ParticipantInfoController(private val participantInfoRepo: ParticipantInfoRepository,
                                private val showingRepo: ShowingRepository) {
    companion object {
        private const val PATH = Application.API_BASE_PATH + "/participantinfo"
    }

    @PutMapping(PATH)
    fun update(@RequestBody body: ParticipantInfoDTO): ParticipantInfo {
        if (body.showingId == null || body.userId == null) {
            throw IllegalArgumentException("Missing showing id and/or user id")
        }
        checkAccess(body.showingId)

        val participantInfo = participantInfoRepo
                .findById(body.id)
                .orElseThrow { NotFoundException("participant info '${body.id}'") }

        if (participantInfo.showingId != body.showingId) {
            throw AccessDeniedException("Oh no you didn't!")
        }

        val newInfo = participantInfo.copy(hasPaid = body.hasPaid, amountOwed = SEK(body.amountOwed))
        return participantInfoRepo.save(newInfo)
    }

    private fun checkAccess(showingId: UUID) {
        val showing = showingRepo
                .findById(showingId)
                .orElseThrow { NotFoundException("showing '${showingId}") }
        if (!showing.isLoggedInUserAdmin()) {
            throw AccessDeniedException("Only the showing admin can update the participant info")
        }
    }
}