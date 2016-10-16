class ChangeNameOfGiftCardTypeColumn < ActiveRecord::Migration[5.0]
  def change
    rename_column :gift_cards, :type, :card_type
  end
end
