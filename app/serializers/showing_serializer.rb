class ShowingSerializer < ActiveModel::Serializer
  attributes :id, :status, :created_at, :updated_at
  belongs_to :movie
  has_many :time_slots
end
