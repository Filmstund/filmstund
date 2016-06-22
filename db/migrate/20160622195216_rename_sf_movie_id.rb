class RenameSfMovieId < ActiveRecord::Migration[5.0]
  def change
    rename_column :showings, :sf_movie_id, :sf_id
  end
end
