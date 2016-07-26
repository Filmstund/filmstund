class AddPushoverKeyToUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :pushover_key, :string
  end
end
