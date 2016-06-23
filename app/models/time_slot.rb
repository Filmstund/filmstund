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
      info = TimeSlot.get_slot_info(showing.movie.sf_id, sf_slot_id, start_time)
      return info['numberOfAvailableSeats'] unless info.nil?
    end
    nil
  end

  def gold_required?
    if showing.present? and sf_slot_id.present?
      info = TimeSlot.get_slot_info(showing.movie.sf_id, sf_slot_id, start_time)
      return info['loyaltyOnlyForGoldMembers'] unless info.nil?
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
      TimeSlot.new do |ts|
        tags = slot['tags'].map{|t| t['tagName'].downcase}
        ts.start_time      = Time.zone.at(slot['timeMs']/1000)
        ts.auditorium_name = slot['auditoriumName']
        ts.auditorium_id   = slot['auditoriumsys99Code'].to_i
        ts.is_vip          = tags.include?('vip')
        ts.is_3d           = tags.include?('3d')
        ts.theatre         = slot['theatreName']
        ts.theatre_account = slot['theatreMainAccount'].to_i
        ts.sf_slot_id      = slot['id']
      end
    end

    def sf_slots_between from, to, movie
      movie.current_sf_slots.select do |s|
        time = s[:time]
        time >= from && time <= to
      end
    end

    def get_slot_info sf_id, sf_slot_id, start_time
      date = start_time.strftime '%Y%m%d'
      data = SFParty.download_data "/shows/GB/movieid/#{sf_id}/day/#{date}"
      return data['shows'].detect{|e| e['id'] == sf_slot_id} unless data.nil?
      nil
    end
  end
end
