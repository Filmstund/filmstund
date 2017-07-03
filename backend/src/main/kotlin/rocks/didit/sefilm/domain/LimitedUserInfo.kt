package rocks.didit.sefilm.domain

data class LimitedUserInfo(
  val id: UserID = UserID("N/A"),
  val name: String? = null,
  val firstName: String? = null,
  val lastName: String? = null,
  val nick: String? = null,
  val phone: String? = null,
  val avatar: String? = null
)

