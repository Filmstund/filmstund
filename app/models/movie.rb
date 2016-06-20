class Movie
  include HTTParty
  #debug_output $stdout
  base_uri 'https://mobilebackend.sfbio.se/services/5/movies/GB/'
  HEADERS = {
    'User-Agent': 'SF Bio 541 (Android Nexus 6 , N',
    'X-SF-Android-Version': '541',
    'Accept': ' application/json',
    'Authorization': 'Basic U0ZiaW9BUEk6YlNGNVBGSGNSNFoz'
  }

  attr_accessor :title, :title_id, :description, :runtime, :poster, :premiere_date, :sf_id

  def themoviedb
    release_year = (Time.at (premiere_date / 1000)).year
    Rails.cache.fetch("movie/#{title_id}", expires_in: 48.hours) do
      self.class.get_themoviedb_info title, release_year
    end
  end

  def imdb_id
    themoviedb['imdb_id']
  end

  def tagline
    themoviedb['tagline']
  end

  def title_orig
    themoviedb['original_title']
  end

  def genres
    themoviedb['genres'].map{|g| g['name']}
  end

  def overview
    themoviedb['overview']
  end

  def alt_poster
    "http://image.tmdb.org/t/p/w500/#{themoviedb['poster_path']}"
  end

  def backdrop
    "http://image.tmdb.org/t/p/w1000/#{themoviedb['backdrop_path']}"
  end


  class << self
    def find id
      parse_sf_movie_data(download_data "/movieid/#{id}")
    end

    def all
      current
    end

    def current
      request
    end

    def toplist
      request '/toplist'
    end

    def upcoming
      request '/upcoming'
    end

private
    def request url=''
      parse_collection(download_data url)
    end

    def download_data url
      resp = get(url, {headers: HEADERS})
      if resp.success?
        resp.parsed_response
      else
        # TODO raise some appropriate exception
        p "Failed to download #{url} | Resp: #{resp.response}"
      end
    end

    def parse_sf_movie_data data
      m = Movie.new
      m.title = data['movieName']
      m.title_id = data['titleId']
      m.description = data['shortDescription']
      m.runtime =  data['length']
      m.poster =  data['placeHolderPosterURL'].sub('_WIDTH_', '512')
      m.sf_id = data['id']
      m.premiere_date = data['premiereDate']
      m
    end

    def parse_collection data
      data['movies'].collect do |m|
        parse_sf_movie_data m
      end
    end

    public
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
end
