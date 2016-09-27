class Attendee < ApplicationRecord
  belongs_to :user
  belongs_to :showing

  has_one :time_slot, through: :showing
end
