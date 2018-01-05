package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.domain.Företagsbiljett
import java.time.LocalDate

data class ForetagsbiljettDTO(val number: String, val expires: LocalDate = LocalDate.now().plusYears(1), val status: Företagsbiljett.Status?)
data class UserDetailsDTO(val nick: String?, val phone: String?, val sfMembershipId: String?)