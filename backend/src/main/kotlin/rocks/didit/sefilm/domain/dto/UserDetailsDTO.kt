package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.domain.Företagsbiljett
import java.time.LocalDate

data class FöretagsbiljettDTO(val number: String, val expires: LocalDate, val status: Företagsbiljett.Status?)
data class UserDetailsDTO(val nick: String?, val phone: String?, val sfMembershipId: String?, val foretagsbiljetter: List<FöretagsbiljettDTO> = emptyList())