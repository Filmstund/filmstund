class UpdateInfoFromImdbIdJob < ApplicationJob
  queue_as :default

  def perform(movie)
    info = (get_themoviedb_info_from movie.imdb_id)['movie_results']
    if info.size == 1
      movie.update_from_themoviedb info.first
    end
  end
private
  def get_themoviedb_info_from imdbid
    Tmdb::Find.imdb_id imdbid
  end
end
