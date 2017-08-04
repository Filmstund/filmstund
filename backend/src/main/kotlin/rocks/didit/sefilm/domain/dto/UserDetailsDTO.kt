package rocks.didit.sefilm.domain.dto

import rocks.didit.sefilm.domain.Foretagsbiljett

data class UserDetailsDTO(val nick: String?, val phone: String?, val bioklubbnummer: String?, val foretagsbiljetter: List<Foretagsbiljett> = emptyList())