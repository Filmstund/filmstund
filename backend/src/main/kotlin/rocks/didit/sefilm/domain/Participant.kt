package rocks.didit.sefilm.domain

open class Participant(val userID: UserID)

class PaymentParticipant(uid: UserID, val payment: PaymentOption) : Participant(uid)
class LimitedParticipant(uid: UserID) : Participant(uid)