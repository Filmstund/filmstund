class InfoFromThemoviedbJob < ApplicationJob
  queue_as :default

  def perform(movie)
    info = get_themoviedb_info movie.title, movie.premiere_date.year
    movie.update_from_themoviedb info
  end
private
  def get_themoviedb_info title, release_year
    search = Tmdb::Search.new
    search.resource 'movie'
    # The following may yield a subtle bug around new year.
    search.year release_year
    search.query title
    results = search.fetch
    if results.count == 1
      return Tmdb::Movie.detail(results[0]['id'])
    end
    nil
  end
end
