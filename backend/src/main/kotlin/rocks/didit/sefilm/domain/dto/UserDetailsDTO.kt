package rocks.didit.sefilm.domain.dto

import java.time.LocalDate

data class FöretagsbiljettDTO(val number: String, val expires: LocalDate)
data class UserDetailsDTO(val nick: String?, val phone: String?, val sfMembershipId: String?, val foretagsbiljetter: List<FöretagsbiljettDTO> = emptyList())