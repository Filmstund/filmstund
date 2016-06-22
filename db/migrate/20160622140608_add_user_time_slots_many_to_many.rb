class AddUserTimeSlotsManyToMany < ActiveRecord::Migration[5.0]
  def change
    create_table :users_time_slots, id: false do |t|
      t.belongs_to :user, index: true
      t.belongs_to :time_slot, index: true
    end
  end
end
