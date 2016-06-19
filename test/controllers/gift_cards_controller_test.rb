require 'test_helper'

class GiftCardsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @gift_card = gift_cards(:one)
  end

  test "should get index" do
    get gift_cards_url
    assert_response :success
  end

  test "should create gift_card" do
    assert_difference('GiftCard.count') do
      post gift_cards_url, params: { gift_card: { number: @gift_card.number, type: @gift_card.type } }
    end

    assert_response 201
  end

  test "should show gift_card" do
    get gift_card_url(@gift_card)
    assert_response :success
  end

  test "should update gift_card" do
    patch gift_card_url(@gift_card), params: { gift_card: { number: @gift_card.number, type: @gift_card.type } }
    assert_response 200
  end

  test "should destroy gift_card" do
    assert_difference('GiftCard.count', -1) do
      delete gift_card_url(@gift_card)
    end

    assert_response 204
  end
end
