class TimeSlot < ApplicationRecord
  belongs_to :showing
  has_and_belongs_to_many :users
end
