class AddIndexForSfSlotIdToTimeSlots < ActiveRecord::Migration[5.0]
  def change
    add_index :time_slots, :sf_slot_id
  end
end
