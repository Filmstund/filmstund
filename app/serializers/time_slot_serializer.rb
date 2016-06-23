class TimeSlotSerializer < ActiveModel::Serializer
  attributes :id, :price, :start_time, :showing_id, :auditorium_name, :auditorium_id, :theatre, :theatre_account, :is_vip, :is_3d, :sf_slot_id, :created_at, :updated_at, :sf_booking_url

  attribute :available_seats
  attribute :gold_required?, key: :gold_required
  cache only: [:available_seats, :gold_required], skip_digest: true, expires_in: 30.minutes
end
