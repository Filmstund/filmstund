class Movie < ApplicationRecord
  include ActiveModel::Serialization
  include HTTParty
  #debug_output $stdout
  base_uri 'https://mobilebackend.sfbio.se/services/5/movies/GB/'
  HEADERS = {
    'User-Agent': 'SF Bio 541 (Android Nexus 6 , N',
    'X-SF-Android-Version': '541',
    'Accept': ' application/json',
    'Authorization': 'Basic U0ZiaW9BUEk6YlNGNVBGSGNSNFoz'
  }
  self.primary_key = :sf_id

  def update_from_imdb_id
    UpdateInfoFromImdbIdJob.perform_later self
  end

  def update_from_themoviedb info
    self.title = info['original_title']
    self.imdb_id = info['imdb_id'] unless info['imdb_id'].nil?
    self.themoviedb_id = info['id']
    self.description = info['overview']
    self.tagline = info['tagline']

    genres = info['genres']
    self.genres = genres.map{|g| g['name']}.join "," unless genres.nil?
    save!
  end

  class << self
    def find id
      begin
        movie = super id
      rescue ActiveRecord::RecordNotFound => e
        movie = parse_sf_movie_data(download_data "/movieid/#{id}")
        if movie.nil?
          raise e
        end
        movie.save!
      end
      movie
    end

    def all_sf
      combined = current + upcoming
      combined.uniq {|item| item.sf_id}
      combined.sort! {|x,y| x.premiere_date <=> y.premiere_date}
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
      Movie.new do |m|
        m.sf_id = data['id']
        m.title = data['movieName']
        m.description = data['shortDescription'].gsub("&nbsp;", "\u00a0")
        m.runtime = if data['length'] == 0 then nil else data['length'] end
        m.poster = data['placeHolderPosterURL'].sub('_WIDTH_', '512')
        m.premiere_date = Time.at(data['premiereDate']/1000)
      end
    end

    def parse_collection data
      data['movies'].map do |d|
        movie = Movie.find_by sf_id: d['id']
        if movie.nil?
          movie = parse_sf_movie_data d
          movie.save!
          InfoFromThemoviedbJob.perform_later movie
        end
        if movie.runtime.nil? and d['length'] != 0
          movie.runtime = d['length']
          movie.save!
        end
        movie
      end
    end
  end
end
