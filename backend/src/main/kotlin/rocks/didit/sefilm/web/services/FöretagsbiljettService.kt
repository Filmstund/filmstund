package rocks.didit.sefilm.web.services

import org.springframework.stereotype.Component
import rocks.didit.sefilm.database.repositories.ShowingRepository
import rocks.didit.sefilm.domain.FtgBiljettParticipant
import rocks.didit.sefilm.domain.Företagsbiljett
import rocks.didit.sefilm.domain.Participant
import java.time.LocalDate

@Component
class FöretagsbiljettService(private val showingRepository: ShowingRepository) {


    public fun getStatusOfTicket(ticket: Företagsbiljett) : Företagsbiljett.Status {
        if(ticket.expires < LocalDate.now()){
            return Företagsbiljett.Status.Expired
        }

        val showings = showingRepository.findAll()
                .filter { s -> s.participants.any { p -> hasTicket(p, ticket) } }

        if (showings.size > 1) {
            throw AssertionError("More than one showing with Företagsbiljett: ${ticket.number}")
        }

        if(showings.isEmpty()) {
            return Företagsbiljett.Status.Available
        }

        return if(showings.first().ticketsBought) {
            Företagsbiljett.Status.Used
        } else {
            Företagsbiljett.Status.Available
        }

    }

    private fun hasTicket(p: Participant, ticket: Företagsbiljett): Boolean {
        return when(p) {
            is FtgBiljettParticipant -> p.ticketNumber == ticket.number
            else -> false
        }
    }

}