class AttendeeSerializer < ActiveModel::Serializer
  attributes :id, :user_id, :nick
  attribute :gift_card, if: -> { object.showing.owner == current_user || object.user == current_user }

  def nick
    object.user.nick
  end
end
