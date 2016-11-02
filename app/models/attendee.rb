class Attendee < ApplicationRecord
  belongs_to :user
  belongs_to :showing
  belongs_to :gift_card

  has_one :time_slot, through: :showing
end
