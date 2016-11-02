class Attendee < ApplicationRecord
  belongs_to :user
  belongs_to :showing
  belongs_to :gift_card, optional: true

  has_one :time_slot, through: :showing
end
