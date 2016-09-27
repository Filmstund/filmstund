class AttendeeSerializer < ActiveModel::Serializer
  attributes :id, :user_id, :nick

  def nick
    object.user.nick
  end
end