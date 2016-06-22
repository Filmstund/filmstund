class TimeSlot < ApplicationRecord
  include SFParty
  belongs_to :showing
  has_and_belongs_to_many :users

  def price
    # This ensures that this TimeSlot is a valid SF time slot
    # and not a temporary one
    if sf_slot_id.present? and theatre_account.present?
      data = SFParty.download_data "/shows/showid/#{sf_slot_id}/theatremainaccount/#{theatre_account}"
      return data['adultPrice'] unless data.nil?
    end
  end

  def available_seats
    if showing.present? and sf_slot_id.present?
      date = start_time.strftime '%Y%m%d'
      data = SFParty.download_data "/shows/GB/movieid/#{showing.movie.sf_id}/day/#{date}"
      return nil if data.nil?
      return data['shows'].detect{|e| e['id'] == sf_slot_id}['numberOfAvailableSeats']
    end
    nil
  end

  def sf_booking_url
    d = start_time.strftime "%Y%m%d"
    t = start_time.strftime "%H%M"
    "http://www.sf.se/biljetter/bokningsflodet/valj-antal-biljetter/?Auditorium=#{auditorium_id}&Date=#{d}&Time=#{t}&City=GB"
  end

  class << self
    def new_from_sf_slot slot
      TimeSlot.new do |s|
        s.start_time = slot[:time]
        s.auditorium_name = slot[:auditorium_name]
        s.auditorium_id = slot[:auditorium_id]
        s.theatre = slot[:theatre]
        s.theatre_account = slot[:theatre_account]
        s.is_vip = slot[:is_vip]
        s.is_3d = slot[:is_3d]
        s.sf_slot_id = slot[:sf_slot_id]
      end
    end

    def sf_slots_between from, to, movie
      movie.current_sf_slots.select do |s|
        time = s[:time]
        time >= from && time <= to
      end
    end
  end
end
