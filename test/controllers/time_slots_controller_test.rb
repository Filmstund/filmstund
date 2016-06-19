require 'test_helper'

class TimeSlotsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @time_slot = time_slots(:one)
  end

  test "should get index" do
    get time_slots_url
    assert_response :success
  end

  test "should create time_slot" do
    assert_difference('TimeSlot.count') do
      post time_slots_url, params: { time_slot: { showing_id: @time_slot.showing_id, start_time: @time_slot.start_time } }
    end

    assert_response 201
  end

  test "should show time_slot" do
    get time_slot_url(@time_slot)
    assert_response :success
  end

  test "should update time_slot" do
    patch time_slot_url(@time_slot), params: { time_slot: { showing_id: @time_slot.showing_id, start_time: @time_slot.start_time } }
    assert_response 200
  end

  test "should destroy time_slot" do
    assert_difference('TimeSlot.count', -1) do
      delete time_slot_url(@time_slot)
    end

    assert_response 204
  end
end
