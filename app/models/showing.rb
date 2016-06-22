class Showing < ApplicationRecord
  belongs_to :movie, foreign_key: :sf_id
  has_many :time_slots
end
