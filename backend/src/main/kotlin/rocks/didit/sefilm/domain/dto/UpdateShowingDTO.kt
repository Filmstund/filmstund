package rocks.didit.sefilm.domain.dto

data class UpdateShowingDTO(val price: Long = 0,
                            val private: Boolean = false,
                            val ticketsBought: Boolean = false) {

}