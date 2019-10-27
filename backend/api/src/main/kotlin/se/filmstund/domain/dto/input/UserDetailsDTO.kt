package se.filmstund.domain.dto.input

import se.filmstund.domain.Nick
import se.filmstund.domain.PhoneNumber
import se.filmstund.domain.id.FilmstadenMembershipId

data class UserDetailsDTO(val nick: Nick?, val phone: PhoneNumber?, val filmstadenMembershipId: FilmstadenMembershipId?)