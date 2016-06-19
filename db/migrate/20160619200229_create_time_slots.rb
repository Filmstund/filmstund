class CreateTimeSlots < ActiveRecord::Migration[5.0]
  def change
    create_table :time_slots do |t|
      t.time :start_time
      t.references :showing_id, foreign_key: true

      t.timestamps
    end
  end
end
