class CreateBioord < ActiveRecord::Migration[5.0]
  def change
    create_table :bioord do |t|
      t.integer :number
      t.string :phrase

      t.timestamps
    end
  end
end
