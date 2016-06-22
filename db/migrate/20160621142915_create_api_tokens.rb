class CreateApiTokens < ActiveRecord::Migration[5.0]
  def change
    create_table :api_tokens do |t|
      t.references :user, foreign_key: true
      t.string :token
      t.string :comment

      t.timestamps
    end
  end
end
