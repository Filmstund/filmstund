class User < ApplicationRecord
  has_and_belongs_to_many :time_slots
  has_many :tokens, class_name: ApiToken
  before_save :default_values

  def self.find_by_email(email, attrs = {})
    user = self.find_by(email: email)

    return user if user

    User.create! attrs do |u|
      u.email = email
    end
  end

  def set_time_slots_for_showing showing, time_slots_for_showing
    time_slots_for_other_showings = self.time_slots.select { |slot| slot.showing != showing }
    self.time_slots = time_slots_for_other_showings | time_slots_for_showing
  end

  private
    def default_values
      self.bioklubbsnummer = bioklubbsnummer.presence || ''
      self.sf_membership_level = sf_membership_level.presence || 'BRONZE'
      self.phone_number = phone_number.presence || ''
    end
end
