class CreateOrders < ActiveRecord::Migration[5.0]
  def change
    create_table :orders do |t|
      t.string :price
      t.references :payer, foreign_key: true

      t.timestamps
    end

    create_table :orders_users, id: false do |t|
      t.belongs_to :order, index: true
      t.belongs_to :user, index: true
    end
  end
end
