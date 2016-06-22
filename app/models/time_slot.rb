class TimeSlot < ApplicationRecord
  belongs_to :showing
  has_and_belongs_to_many :users


  def sf_booking_url
    d = start_time.strftime "%Y%m%d"
    t = start_time.strftime "%H%M"
    "http://www.sf.se/biljetter/bokningsflodet/valj-antal-biljetter/?Auditorium=#{auditorium_id}&Date=#{d}&Time=#{t}&City=GB"
  end

  def self.new_from_sf_slot slot
    TimeSlot.new do |s|
      s.start_time = slot[:time]
      s.auditorium_name = slot[:auditorium_name]
      s.auditorium_id = slot[:auditorium_id]
      s.theatre = slot[:theatre]
      s.is_vip = slot[:is_vip]
      s.is_3d = slot[:is_3d]
    end
  end
  def self.sf_slots_between from, to, movie
    movie.current_show_dates.select do |s|
      time = s[:time]
      time >= from && time <= to
    end
  end
end
