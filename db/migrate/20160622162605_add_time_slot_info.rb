class AddTimeSlotInfo < ActiveRecord::Migration[5.0]
  def change
    add_column :time_slots, :auditorium_name, :string
    add_column :time_slots, :auditorium_id, :integer
    add_column :time_slots, :theatre, :string
    add_column :time_slots, :is_vip, :boolean
    add_column :time_slots, :is_3d, :boolean
  end
end
