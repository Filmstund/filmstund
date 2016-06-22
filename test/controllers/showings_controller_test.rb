require 'test_helper'

class ShowingsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @showing = showings(:one)
  end

  test "should get index" do
    get showings_url
    assert_response :success
  end

  test "should create showing" do
    assert_difference('Showing.count') do
      post showings_url, params: { showing: { duration: @showing.duration, imdb_id: @showing.imdb_id, poster_url: @showing.poster_url, sf_id: @showing.sf_id, status: @showing.status } }
    end

    assert_response 201
  end

  test "should show showing" do
    get showing_url(@showing)
    assert_response :success
  end

  test "should update showing" do
    patch showing_url(@showing), params: { showing: { duration: @showing.duration, imdb_id: @showing.imdb_id, poster_url: @showing.poster_url, sf_id: @showing.sf_id, status: @showing.status } }
    assert_response 200
  end

  test "should destroy showing" do
    assert_difference('Showing.count', -1) do
      delete showing_url(@showing)
    end

    assert_response 204
  end
end
