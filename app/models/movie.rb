class Movie < ApplicationRecord
  include SFParty
  include ActiveModel::Serialization
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
    Rails.cache.delete('movies/all_sf')
  end

  def current_sf_slots
    data = Movie.sf_movie sf_id
    return [] if data.nil?

    #shows = []
    dates = data['showDatesMs'].map{|d| (Time.zone.at d/1000).to_date}
    dates.flat_map do |d|
      shows_hash = Movie.sf_slots_at_date sf_id, d
      next if shows_hash.nil?
      shows_hash['shows'].map do |s|
        tags = s['tags'].map{|t| t['tagName'].downcase}
        {
          auditorium_name: s['auditoriumName'],
          auditorium_id: s['auditoriumsys99Code'].to_i,
          gold_required: s['loyaltyOnlyForGoldMembers'],
          available_seats: s['numberOfAvailableSeats'],
          is_vip: tags.include?('vip'),
          is_3d: tags.include?('3d'),
          theatre: s['theatreName'],
          theatre_account: s['theatreMainAccount'].to_i,
          time: Time.zone.at(s['timeMs']/1000),
          sf_slot_id: s['id']
        }
      end
    end.sort{|x,y| x['time'] <=> y['time']}
  end

  class << self
    def find id
      begin
        movie = super id
      rescue ActiveRecord::RecordNotFound => e
        movie = parse_sf_movie_data(sf_movie id)
        if movie.nil?
          raise e
        end
        movie.save!
      end
      movie
    end

    def all_sf
      Rails.cache.fetch("movies/all_sf", expires_in: 12.hours) do
        combined = current + upcoming
        combined.uniq! {|item| item.sf_id}
        combined.sort! {|x,y| x.premiere_date <=> y.premiere_date}
      end
    end

    def current
      request '/movies/GB'
    end

    def toplist
      request '/movies/GB/toplist'
    end

    def upcoming
      request '/movies/GB/upcoming'
    end

    def sf_movie id
      SFParty::download_data "/movies/GB/movieid/#{id}"
    end

    def sf_slots_at_date id, date
      Rails.cache.fetch "sfslotsatdate/#{id}/#{date.to_s}", expires_in: 30.minutes do
        sf_slots_at_date_fresh id, date
      end
    end

    def sf_slots_at_date_fresh id, date
      SFParty::download_data "/shows/GB/movieid/#{id}/day/#{date.strftime "%Y%m%d"}"
    end

private
    def request url=''
      parse_collection(SFParty::download_data url)
    end

    def parse_sf_movie_data data
      Movie.new do |m|
        m.sf_id = data['id']
        m.title = data['movieName']
        m.description = data['shortDescription'].gsub("&nbsp;", "\u00a0")
        m.runtime = if data['length'] == 0 then nil else data['length'] end
        m.poster = data['placeHolderPosterURL'].sub('_WIDTH_', '512')
        m.premiere_date = Time.zone.at(data['premiereDate']/1000)
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
