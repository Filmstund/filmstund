class AddSelectedSlotToShowings < ActiveRecord::Migration[5.0]
  def change
    add_reference :showings, :selected_time_slot, foreign_key: true
  end
end
