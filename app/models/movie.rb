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

  attr_accessor :title, :description, :runtime, :poster, :premiere_date, :sf_id, :imdb_id

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
      m.description = data['shortDescription']
      m.runtime =  data['length']
      m.poster =  data['placeHolderPosterURL'].sub('_WIDTH_', '512')
      m.sf_id = data['id']
      m.imdb_id = nil
      m.premiere_date = data['premiereDate']
      m
    end

    def parse_collection data
      data['movies'].collect do |m|
        parse_sf_movie_data m
      end
    end
  end
end
