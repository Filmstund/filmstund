class TimeSlotSerializer < ActiveModel::Serializer
  attributes :id, :price, :start_time, :showing_id, :auditorium_name, :auditorium_id, :theatre, :theatre_account, :is_vip, :is_3d, :sf_slot_id, :created_at, :updated_at
end
