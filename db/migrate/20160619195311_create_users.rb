class CreateUsers < ActiveRecord::Migration[5.0]
  def change
    create_table :users do |t|
      t.string :nick
      t.string :email
      t.string :bioklubbsnummer
      t.string :sf_membership_level
      t.string :phone_number

      t.timestamps
    end
  end
end
