class CreateAttendees < ActiveRecord::Migration[5.0]
  def change
    create_table :attendees do |t|
      t.references :user, foreign_key: true
      t.references :showing, foreign_key: true
      t.boolean :notify
      t.string :payment_method

      t.timestamps
    end
  end
end
