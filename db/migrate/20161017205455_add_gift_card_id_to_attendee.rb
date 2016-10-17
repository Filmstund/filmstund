class AddGiftCardIdToAttendee < ActiveRecord::Migration[5.0]
  def change
    add_reference :attendees, :gift_card, index: true
  end
end
