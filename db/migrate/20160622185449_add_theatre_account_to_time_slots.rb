class AddTheatreAccountToTimeSlots < ActiveRecord::Migration[5.0]
  def change
    add_column :time_slots, :theatre_account, :integer
  end
end
