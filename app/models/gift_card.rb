class GiftCard < ApplicationRecord
  belongs_to :owner, class_name: User
  enum type: [ :bioklubbskort, :foretagsbiljett, :rabattkort, :presentkort ]
  validates :number, format: {with: /\A(\d{8}|\d{11})\z/, message: 'Invalid number id'}
end
