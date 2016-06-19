class CreateTimeSlots < ActiveRecord::Migration[5.0]
  def change
    create_table :time_slots do |t|
      t.time :start_time
      t.references :showing, foreign_key: true

      t.timestamps
    end

    create_table :time_slots_users, id: false do |t|
      t.belongs_to :time_slot, index: true
      t.belongs_to :user, index: true
    end

    create_table :showings_time_slots, id: false do |t|
      t.belongs_to :showing, index: true
      t.belongs_to :time_slot, index: true
    end
  end
end
