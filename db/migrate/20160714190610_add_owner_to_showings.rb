class AddOwnerToShowings < ActiveRecord::Migration[5.0]
  def change
    add_reference :showings, :owner, foreign_key: true
  end
end
