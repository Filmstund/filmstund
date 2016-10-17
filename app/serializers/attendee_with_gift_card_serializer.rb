class AttendeeWithGiftCardSerializer < ActiveModel::Serializer
  attributes :id, :user_id, :nick, :gift_card

  def nick
    object.user.nick
  end
end