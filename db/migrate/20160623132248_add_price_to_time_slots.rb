class AddPriceToTimeSlots < ActiveRecord::Migration[5.0]
  def change
    add_column :time_slots, :price, :integer
  end
end
