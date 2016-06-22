class ChangeTypeOfSfMovieIdInShowings < ActiveRecord::Migration[5.0]
  def change
    change_column :showings, :sf_movie_id, :string
  end
end
