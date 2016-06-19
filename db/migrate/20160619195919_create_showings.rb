class CreateShowings < ActiveRecord::Migration[5.0]
  def change
    create_table :showings do |t|
      t.string :imdb_id
      t.string :sf_movie_id
      t.integer :ticket_price
      t.string :poster_url
      t.integer :duration
      t.integer :status
      t.boolean :is_3d
      t.boolean :is_vip

      t.timestamps
    end
  end
end
