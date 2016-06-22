class AddMovieTable < ActiveRecord::Migration[5.0]
  def change
    create_table :movies, id: false do |t|
      t.string :sf_id, primary_key: true
      t.string :imdb_id
      t.string :themoviedb_id
    end
  end
end
