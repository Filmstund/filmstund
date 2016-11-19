class CreateGiftCards < ActiveRecord::Migration[5.0]
  def change
    create_table :gift_cards do |t|
      t.references :owner, foreign_key: { to_table: :users }, index: true
      t.string :number
      t.string :type

      t.timestamps
    end
  end
end
