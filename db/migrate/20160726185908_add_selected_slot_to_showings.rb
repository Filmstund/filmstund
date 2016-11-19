class AddSelectedSlotToShowings < ActiveRecord::Migration[5.0]
  def change
    add_reference :showings, :selected_time_slot, foreign_key: { to_table: :time_slots }, index: true
  end
end