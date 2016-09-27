class ShowingSerializer < ActiveModel::Serializer
  attributes :id, :status, :created_at, :updated_at, :is_admin
  belongs_to :movie
  belongs_to :owner
  has_many :time_slots
  has_many :attendees
  has_one :selected_time_slot

  def is_admin
    object.owner == current_user
  end
end
