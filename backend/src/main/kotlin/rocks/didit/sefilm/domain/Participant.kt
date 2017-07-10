package rocks.didit.sefilm.domain

open class Participant(val userID: UserID)

class SwishParticipant(val uid: UserID, val payment: String = "swish") : Participant(uid)
class ForetagsbiljettParticipant(val uid: UserID, val payment: Foretagsbiljett) : Participant(uid)
class LimitedParticipant(val uid: UserID) : Participant(uid)