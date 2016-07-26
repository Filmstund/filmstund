class Showing < ApplicationRecord
  enum status: [ :cancelled, :open, :confirmed, :done ]
  belongs_to :owner, class_name: User
  belongs_to :movie, foreign_key: :sf_id
  has_many :time_slots
end
