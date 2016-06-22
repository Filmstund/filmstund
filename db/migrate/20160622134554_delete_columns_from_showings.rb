class DeleteColumnsFromShowings < ActiveRecord::Migration[5.0]
  def change
    remove_column :showings, :imdb_id
    remove_column :showings, :ticket_price
    remove_column :showings, :poster_url
    remove_column :showings, :duration
    remove_column :showings, :is_3d
    remove_column :showings, :is_vip
  end
end
