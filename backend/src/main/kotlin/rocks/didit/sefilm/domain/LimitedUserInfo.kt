package rocks.didit.sefilm.domain

import rocks.didit.sefilm.database.entities.User


data class LimitedUserInfo(
        val id: UserID = UserID("N/A"),
        val name: String? = null,
        val nick: String? = null,
        val phone: String? = null,
        val avatar: String? = null
)

fun User.toLimitedUserInfo(): LimitedUserInfo {
    return LimitedUserInfo(this.id, this.name, this.nick, this.phone, this.avatar)
}