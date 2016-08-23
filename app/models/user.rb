class User < ApplicationRecord
  scope :with_push_key, -> { where.not(pushover_key: nil) }
  has_and_belongs_to_many :time_slots
  has_many :tokens, class_name: ApiToken
  has_many :showings, foreign_key: :owner_id
  before_save :default_values
  before_validation :strip_numbers

  validates_format_of :phone_number, with: /\A\d{10}\z/, allow_blank: true
  validates_format_of :bioklubbsnummer, with: /\A\d{8}\d{3}?\z/, allow_blank: true

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

    def strip_numbers
      self.phone_number = (self.phone_number || '').gsub /[^0-9]/, ''
      self.bioklubbsnummer = (self.bioklubbsnummer || '').gsub /[^0-9]/, ''
    end
end
