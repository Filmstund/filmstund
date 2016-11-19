class AddOwnerToShowings < ActiveRecord::Migration[5.0]
  def change
    add_reference :showings, :owner, foreign_key: { to_table: :users }, index: true
  end
end
