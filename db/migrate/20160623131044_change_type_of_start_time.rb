class ChangeTypeOfStartTime < ActiveRecord::Migration[5.0]
  def change
    change_column :time_slots, :start_time, :datetime
  end
end
