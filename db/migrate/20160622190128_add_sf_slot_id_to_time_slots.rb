class AddSfSlotIdToTimeSlots < ActiveRecord::Migration[5.0]
  def change
    add_column :time_slots, :sf_slot_id, :string
  end
end
