class User < ApplicationRecord
  has_and_belongs_to_many :time_slots
  has_many :tokens, class_name: ApiToken

  def self.find_by_email(email, attrs = {})
    user = self.find_by(email: email)

    return user if user

    user = User.new(attrs)
    user.email = email
    user.save!

    user
  end
end
