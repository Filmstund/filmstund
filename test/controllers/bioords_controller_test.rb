require 'test_helper'

class BioordControllerTest < ActionDispatch::IntegrationTest
  setup do
    @bioord = bioord(:one)
  end

  test "should get index" do
    get bioord_url
    assert_response :success
  end

  test "should create bioord" do
    assert_difference('Bioord.count') do
      post bioord_url, params: { bioord: { number: @bioord.number, phrase: @bioord.phrase } }
    end

    assert_response 201
  end

  test "should show bioord" do
    get bioord_url(@bioord)
    assert_response :success
  end

  test "should update bioord" do
    patch bioord_url(@bioord), params: { bioord: { number: @bioord.number, phrase: @bioord.phrase } }
    assert_response 200
  end

  test "should destroy bioord" do
    assert_difference('Bioord.count', -1) do
      delete bioord_url(@bioord)
    end

    assert_response 204
  end
end
