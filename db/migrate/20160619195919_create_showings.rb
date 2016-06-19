class CreateShowings < ActiveRecord::Migration[5.0]
  def change
    create_table :showings do |t|
      t.string :imdb_id
      t.string :sf_movie_id
      t.string :poster_url
      t.integer :duration
      t.integer :status

      t.timestamps
    end
  end
end
