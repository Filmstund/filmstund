class AttendeeSerializer < ActiveModel::Serializer
  attributes :id, :user_id, :nick
  attribute :bioklubbsnummer, :gift_card, if: :user_owns_showing_or_card

  def nick
    object.user.nick
  end

  def bioklubbsnummer
    object.user.bioklubbsnummer
  end

  def user_owns_showing_or_card
    object.showing.owner == current_user || object.user == current_user
  end
end
