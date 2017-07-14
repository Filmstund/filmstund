package rocks.didit.sefilm.domain

open class Participant(val userID: UserID)

class PaymentParticipant(val uid: UserID, val payment: PaymentOption) : Participant(uid)
class LimitedParticipant(val uid: UserID) : Participant(uid)